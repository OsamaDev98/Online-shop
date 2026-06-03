import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة لمعالجة إنشاء الطلبات وبوابة الدفع Paymob
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      address, 
      province, 
      city, 
      notes, 
      couponCode, 
      paymentMethod, 
      userId, 
      items 
    } = body;

    // 1. التحقق من المدخلات
    if (!name || !email || !phone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "بيانات الطلب غير مكتملة." },
        { status: 400 }
      );
    }

    // 2. التحقق من المخزون وحساب إجمالي السعر الفعلي من قاعدة البيانات لمنع التلاعب
    let calculatedSubtotal = 0;
    const dbItemsToCreate = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return NextResponse.json(
          { error: `المنتج غير موجود.` },
          { status: 404 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `الكمية المطلوبة من "${product.name}" غير متوفرة في المخزن (المتاح: ${product.stock}).` },
          { status: 400 }
        );
      }

      // استخدم سعر الخصم إذا كان متوفراً، وإلا السعر الأصلي
      const activePrice = product.discountPrice !== null ? product.discountPrice : product.price;
      calculatedSubtotal += activePrice * item.quantity;
      
      dbItemsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: activePrice // السعر من قاعدة البيانات
      });
    }

    // 3. حساب تكلفة الشحن ديناميكياً بناءً على المحافظة المحددة
    let shippingFee = 50; // السعر الافتراضي العام
    if (province) {
      const shippingSetting = await prisma.shippingSetting.findUnique({
        where: { province: province.trim() }
      });
      if (shippingSetting && shippingSetting.isActive) {
        shippingFee = shippingSetting.cost;
      }
    }

    // 4. التحقق الآمن من الكوبون وحساب قيمة الخصم المطبق
    let discountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() }
      });

      if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) >= new Date())) {
        if (calculatedSubtotal >= coupon.minOrderAmount) {
          validCouponCode = coupon.code;
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
        }
      }
    }

    const totalAmount = Math.max(0, calculatedSubtotal + shippingFee - discountAmount);

    // 5. خصم الكميات من المخزون
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    // 6. تحديد الحالة البدئية للطلب والدفع
    // في الوضع التجريبي أو الدفع عند الاستلام، نقبل الطلب مباشرة
    const isMock = !process.env.PAYMOB_API_KEY || process.env.PAYMOB_API_KEY === "placeholder_api_key";
    
    const initialStatus = "NEW"; // الحالة الافتراضية
    const initialPaymentStatus = (paymentMethod === "cod") 
      ? "PENDING" 
      : (isMock ? "PAID" : "PENDING");
      
    const initialShippingStatus = "PREPARING";

    // 7. إنشاء الطلب في قاعدة البيانات بالقيم المحدثة
    const order = await prisma.order.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        province: province || "القاهرة",
        city: city || "",
        notes: notes || "",
        totalAmount,
        shippingFee,
        discountAmount,
        couponCode: validCouponCode,
        status: initialStatus,
        paymentStatus: initialPaymentStatus,
        shippingStatus: initialShippingStatus,
        userId: userId || null,
        items: {
          create: dbItemsToCreate
        }
      }
    });

    // 8. في حال اختيار الدفع عند الاستلام أو عدم توفر مفاتيح Paymob (الوضع التجريبي الافتراضي)
    if (paymentMethod === "cod" || isMock) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: paymentMethod === "cod" ? "تم تسجيل طلبك بنجاح بنظام الدفع عند الاستلام." : "تم تسجيل الطلب والدفع افتراضياً بنجاح."
      });
    }

    // 9. الربط مع بوابة دفع Paymob لتوليد رابط الدفع الإلكتروني الفعلي
    const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
    const PAYMOB_INTEGRATION_ID = paymentMethod === "wallet" 
      ? process.env.PAYMOB_WALLET_INTEGRATION_ID 
      : process.env.PAYMOB_INTEGRATION_ID;
    const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

    // أ) المصادقة وجلب رمز التوكن (Auth Token)
    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY })
    });
    
    if (!authResponse.ok) {
      throw new Error("خطأ في مصادقة بوابة الدفع Paymob.");
    }
    
    const { token: authToken } = await authResponse.json();

    // ب) تسجيل الطلب في بوابة Paymob
    const paymobOrderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: Math.round(totalAmount * 100), // القيمة بالقروش (cents)
        currency: "EGP",
        items: []
      })
    });

    if (!paymobOrderResponse.ok) {
      throw new Error("خطأ في تسجيل الطلب لدى Paymob.");
    }

    const { id: paymobOrderId } = await paymobOrderResponse.json();

    // تحديث رقم طلب Paymob بقاعدة البيانات
    await prisma.order.update({
      where: { id: order.id },
      data: { paymobOrderId: String(paymobOrderId) }
    });

    // ج) توليد مفتاح الدفع (Payment Key)
    const paymobKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(totalAmount * 100),
        expiration: 3600, // صلاحية الجلسة بساعة واحدة
        order_id: paymobOrderId,
        billing_data: {
          apartment: "NA",
          floor: "NA",
          street: address.substring(0, 50),
          building: "NA",
          shipping_method: "PKG",
          postal_code: "NA",
          city: city || "Cairo",
          country: "EG",
          last_name: name.split(" ")[1] || "Customer",
          first_name: name.split(" ")[0] || "Aluminum",
          email: email,
          phone_number: phone
        },
        currency: "EGP",
        integration_id: Number(PAYMOB_INTEGRATION_ID),
        lock_order_when_paid: "true"
      })
    });

    if (!paymobKeyResponse.ok) {
      throw new Error("خطأ في توليد مفتاح عملية الدفع.");
    }

    const { token: paymentKey } = await paymobKeyResponse.json();

    // د) توليد رابط التوجيه النهائي حسب نوع الدفع
    let paymentUrl = "";

    if (paymentMethod === "wallet") {
      const walletResponse = await fetch("https://accept.paymob.com/api/acceptance/payments/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: {
            identifier: phone,
            subtype: "WALLET"
          },
          payment_token: paymentKey
        })
      });

      if (!walletResponse.ok) {
        throw new Error("فشل طلب الدفع بالمحفظة الإلكترونية.");
      }

      const walletData = await walletResponse.json();
      paymentUrl = walletData.redirect_url;
    } else {
      paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentUrl
    });

  } catch (error: any) {
    console.error("Order creation error API:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ داخلي في الخادم." },
      { status: 500 }
    );
  }
}
