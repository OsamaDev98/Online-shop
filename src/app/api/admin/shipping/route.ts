import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// 1. جلب كافة إعدادات الشحن للمدير (GET)
export async function GET(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const settings = await prisma.shippingSetting.findMany({
      orderBy: { province: "asc" }
    });

    return NextResponse.json(settings);

  } catch (error) {
    console.error("Admin shipping fetch error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب إعدادات الشحن." }, { status: 500 });
  }
}

// 2. إضافة محافظة شحن جديدة (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { province, cost, deliveryDays, isActive } = body;

    if (!province || cost === undefined) {
      return NextResponse.json({ error: "اسم المحافظة وتكلفة الشحن مطلوبان." }, { status: 400 });
    }

    const trimmedProvince = province.trim();

    // التحقق من تكرار المحافظة
    const existing = await prisma.shippingSetting.findUnique({
      where: { province: trimmedProvince }
    });

    if (existing) {
      return NextResponse.json({ error: "هذه المحافظة مسجلة بالفعل." }, { status: 400 });
    }

    const setting = await prisma.shippingSetting.create({
      data: {
        province: trimmedProvince,
        cost: Number(cost),
        deliveryDays: deliveryDays || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return NextResponse.json({ success: true, setting });

  } catch (error) {
    console.error("Admin shipping create error:", error);
    return NextResponse.json({ error: "فشل إضافة إعداد الشحن." }, { status: 500 });
  }
}

// 3. تعديل إعداد شحن قائم (PUT)
export async function PUT(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { id, province, cost, deliveryDays, isActive } = body;

    if (!id || !province || cost === undefined) {
      return NextResponse.json({ error: "المعرف واسم المحافظة وتكلفة الشحن مطلوبون للتعديل." }, { status: 400 });
    }

    const trimmedProvince = province.trim();

    // التحقق من التكرار مع سجل آخر
    const existing = await prisma.shippingSetting.findFirst({
      where: {
        province: trimmedProvince,
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "اسم المحافظة مسجل بالفعل لإعداد آخر." }, { status: 400 });
    }

    const setting = await prisma.shippingSetting.update({
      where: { id },
      data: {
        province: trimmedProvince,
        cost: Number(cost),
        deliveryDays: deliveryDays || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true
      }
    });

    return NextResponse.json({ success: true, setting });

  } catch (error) {
    console.error("Admin shipping update error:", error);
    return NextResponse.json({ error: "فشل تعديل إعداد الشحن." }, { status: 500 });
  }
}

// 4. حذف إعداد شحن (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف إعداد الشحن مطلوب." }, { status: 400 });
    }

    await prisma.shippingSetting.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "تم حذف إعداد الشحن بنجاح." });

  } catch (error) {
    console.error("Admin shipping delete error:", error);
    return NextResponse.json({ error: "فشل حذف إعداد الشحن." }, { status: 500 });
  }
}
