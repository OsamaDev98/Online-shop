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

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (shippingStatus !== undefined) updateData.shippingStatus = shippingStatus;

    // إذا تم إلغاء الطلب ولم يكن ملغياً بالفعل، نعيد الكميات للمخزن
    if (status === "CANCELLED" && existingOrder.status !== "CANCELLED") {
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }
    // وإذا تم استرجاع الطلب من ملغي إلى حالة أخرى، نخصم الكميات مجدداً
    else if (status !== undefined && status !== "CANCELLED" && existingOrder.status === "CANCELLED") {
      for (const item of existingOrder.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock < item.quantity) {
          return NextResponse.json({
            error: `لا يمكن إعادة تنشيط الطلب لعدم توافر مخزون كافٍ للمنتج "${product.name}" (المتاح: ${product.stock}).`
          }, { status: 400 });
        }
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }

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
