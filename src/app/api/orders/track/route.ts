import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "معرف الطلب مطلوب للتتبع." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "لم يتم العثور على طلب بهذا الكود. يرجى التحقق من الرقم المنسوخ وإدخاله مجدداً." },
        { status: 404 }
      );
    }

    // إخفاء البيانات الحساسة جزئياً لحماية خصوصية العملاء
    const phoneLength = order.customerPhone.length;
    const maskedPhone = order.customerPhone.substring(0, 4) + "****" + order.customerPhone.substring(Math.max(4, phoneLength - 3));
    const firstName = order.customerName.split(" ")[0];

    return NextResponse.json({
      id: order.id,
      customerName: firstName,
      customerPhone: maskedPhone,
      shippingAddress: order.shippingAddress,
      province: order.province,
      city: order.city,
      notes: order.notes,
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      discountAmount: order.discountAmount,
      couponCode: order.couponCode,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images.split(",")[0],
        quantity: item.quantity,
        price: item.price
      }))
    });

  } catch (error) {
    console.error("Order tracking API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء البحث عن تفاصيل الطلب." },
      { status: 500 }
    );
  }
}
