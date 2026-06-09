import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// جلب معرف الطلب المحلي بواسطة معرف طلب Paymob
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymobOrderId = searchParams.get("paymobOrderId");

    if (!paymobOrderId) {
      return NextResponse.json(
        { error: "معرف طلب Paymob مطلوب." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { paymobOrderId: String(paymobOrderId) },
      select: { id: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: "الطلب غير موجود في قاعدة البيانات." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id
    });

  } catch (error: any) {
    console.error("Fetch order by Paymob ID error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء البحث عن الطلب." },
      { status: 500 }
    );
  }
}
