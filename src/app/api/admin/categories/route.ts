import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// 1. إضافة قسم جديد (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, orderIndex } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "الاسم والمُعرّف اللطيف (Slug) مطلوبان." }, { status: 400 });
    }

    // التحقق من تكرار القسم
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug: slug.toLowerCase() }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: "هذا القسم أو المعرّف اللطيف مسجل بالفعل." }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        description: description || null,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0
      }
    });

    return NextResponse.json({ success: true, category });

  } catch (error: any) {
    console.error("Admin category create error:", error);
    return NextResponse.json({ error: "فشل إضافة القسم." }, { status: 500 });
  }
}

// 2. تعديل قسم قائم (PUT)
export async function PUT(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, description, orderIndex } = body;

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "المعرف والاسم والمُعرّف اللطيف مطلوبون للتعديل." }, { status: 400 });
    }

    // التحقق من التكرار مع قسم آخر غير الذي نعدله
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: { not: id },
        OR: [
          { name },
          { slug: slug.toLowerCase() }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json({ error: "الاسم أو المعرّف اللطيف مسجل بالفعل لقسم آخر." }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase(),
        description: description || null,
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0
      }
    });

    return NextResponse.json({ success: true, category });

  } catch (error: any) {
    console.error("Admin category update error:", error);
    return NextResponse.json({ error: "فشل تعديل القسم." }, { status: 500 });
  }
}

// 3. حذف قسم (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف القسم مطلوب." }, { status: 400 });
    }

    // التحقق من وجود منتجات مرتبطة بهذا القسم
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return NextResponse.json({ error: `لا يمكن حذف هذا القسم لأنه يحتوي على ${productsCount} من المنتجات المرتبطة به. يرجى نقل أو حذف المنتجات أولاً.` }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "تم حذف القسم بنجاح." });

  } catch (error: any) {
    console.error("Admin category delete error:", error);
    return NextResponse.json({ error: "فشل حذف القسم." }, { status: 500 });
  }
}
