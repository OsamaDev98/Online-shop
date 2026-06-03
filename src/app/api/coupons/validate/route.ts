import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json(
        { error: "كود الخصم مطلوب." },
        { status: 400 }
      );
    }

    // البحث عن الكوبون
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "كود الخصم المدخل غير موجود أو غير صحيح." },
        { status: 404 }
      );
    }

    // التحقق من حالة النشاط
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "هذا الكوبون لم يعد نشطاً." },
        { status: 400 }
      );
    }

    // التحقق من تاريخ انتهاء الصلاحية
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { error: "عذراً، انتهت صلاحية هذا الكوبون." },
        { status: 400 }
      );
    }

    // التحقق من الحد الأدنى للطلب
    if (subtotal !== undefined && subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `الحد الأدنى لتفعيل هذا الكوبون هو ${coupon.minOrderAmount} ج.م` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount
    });

  } catch (error: any) {
    console.error("Coupon validation API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم." },
      { status: 500 }
    );
  }
}
