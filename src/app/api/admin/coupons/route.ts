import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// 1. جلب كافة الكوبونات (GET)
export async function GET(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(coupons);

  } catch (error) {
    console.error("Admin coupons fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الكوبونات." }, { status: 500 });
  }
}

// 2. إنشاء كوبون جديد (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, isActive, expiryDate } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "يرجى ملء الحقول الإلزامية." }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // التحقق من تكرار الكوبون
    const existing = await prisma.coupon.findUnique({
      where: { code: uppercaseCode }
    });

    if (existing) {
      return NextResponse.json({ error: "كود الخصم هذا مسجل بالفعل." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: uppercaseCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return NextResponse.json({ success: true, coupon });

  } catch (error) {
    console.error("Admin coupon create error:", error);
    return NextResponse.json({ error: "فشل إنشاء الكوبون." }, { status: 500 });
  }
}

// 3. تعديل كوبون (PUT)
export async function PUT(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { id, code, discountType, discountValue, minOrderAmount, isActive, expiryDate } = body;

    if (!id || !code || !discountType || discountValue === undefined) {
      return NextResponse.json({ error: "المعرف والحقول الإلزامية مطلوبة للتعديل." }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // التحقق من تكرار الكوبون مع سجل آخر
    const existing = await prisma.coupon.findFirst({
      where: {
        code: uppercaseCode,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "كود الخصم هذا مستخدم بالفعل لكوبون آخر." }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: uppercaseCode,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return NextResponse.json({ success: true, coupon });

  } catch (error) {
    console.error("Admin coupon update error:", error);
    return NextResponse.json({ error: "فشل تعديل الكوبون." }, { status: 500 });
  }
}

// 4. حذف كوبون (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الكوبون مطلوب." }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "تم حذف الكوبون بنجاح." });

  } catch (error) {
    console.error("Admin coupon delete error:", error);
    return NextResponse.json({ error: "فشل حذف الكوبون." }, { status: 500 });
  }
}
