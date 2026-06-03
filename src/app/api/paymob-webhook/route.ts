import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// معالجة الـ Webhook الخاص بـ Paymob لتحديث حالة الدفع تلقائياً
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const hmac = searchParams.get("hmac");

    // التحقق من صحة الحدث المرسل من Paymob
    if (!body || !body.obj) {
      return NextResponse.json({ error: "بيانات الحدث غير صحيحة." }, { status: 400 });
    }

    const transaction = body.obj;
    const isSuccess = transaction.success === true && transaction.pending === false;
    const paymobOrderId = transaction.order?.id || transaction.order;

    // 1. التحقق من التوقيع (HMAC Signature) إذا كان مفتاح السر مهيأً
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (hmacSecret && hmacSecret !== "placeholder_hmac_secret" && hmac) {
      // ترتيب الحقول المطلوبة من Paymob لحساب الـ HMAC
      const {
        amount_cents,
        created_at,
        currency,
        error_occured,
        has_parent_transaction,
        id: transactionId,
        integration_id,
        is_3d_secure,
        is_auth,
        is_capture,
        is_voided,
        is_refunded,
        parent_transaction,
        pending,
        source_data,
        success
      } = transaction;

      // استخراج الحقول الفرعية من source_data
      const type = source_data?.type || "";
      const pan = source_data?.pan || "";
      const subType = source_data?.sub_type || "";

      // تجميع سلسلة البيانات بالترتيب المخصص من Paymob
      const dataString = 
        `${amount_cents}` +
        `${created_at}` +
        `${currency}` +
        `${error_occured}` +
        `${has_parent_transaction}` +
        `${transactionId}` +
        `${integration_id}` +
        `${is_3d_secure}` +
        `${is_auth}` +
        `${is_capture}` +
        `${is_voided}` +
        `${is_refunded}` +
        `${parent_transaction}` +
        `${pending}` +
        `${type}` +
        `${pan}` +
        `${subType}` +
        `${success}`;

      // حساب التوقيع باستخدام SHA512
      const calculatedHmac = crypto
        .createHmac("sha512", hmacSecret)
        .update(dataString)
        .digest("hex");

      if (calculatedHmac !== hmac) {
        console.warn("Paymob Webhook HMAC verification failed!");
        return NextResponse.json({ error: "فشل التحقق من توقيع الـ HMAC." }, { status: 401 });
      }
    }

    // 2. تحديث الطلب بقاعدة البيانات إذا كانت عملية الدفع ناجحة
    if (isSuccess && paymobOrderId) {
      const order = await prisma.order.findFirst({
        where: { paymobOrderId: String(paymobOrderId) }
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentId: String(transaction.id) // حفظ معرف العملية المالية
          }
        });
        console.log(`Order ${order.id} updated to PAID via Paymob Webhook`);
      } else {
        console.warn(`No order found with paymobOrderId: ${paymobOrderId}`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Paymob Webhook Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الـ Webhook." },
      { status: 500 }
    );
  }
}
