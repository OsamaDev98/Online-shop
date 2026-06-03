import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// تعديل حالات الطلب والدفع والشحن (PUT)
export async function PUT(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, paymentStatus, shippingStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الطلب مطلوب للتحديث." }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (shippingStatus !== undefined) updateData.shippingStatus = shippingStatus;

    const order = await prisma.order.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    console.error("Admin order status update error:", error);
    return NextResponse.json({ error: "فشل تحديث حالات الطلب." }, { status: 500 });
  }
}
