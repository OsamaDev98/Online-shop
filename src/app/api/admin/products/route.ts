import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// توليد سلوغ نظيف للرابط باللغة العربية والانجليزية
function generateSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "") // إبقاء الحروف العربية والإنجليزية والأرقام
    .replace(/\s+/g, "-") // تحويل الفراغات لشرطات
    .replace(/-+/g, "-"); // إزالة الشرطات المتكررة
}

// 1. إضافة منتج جديد أو تكراره (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();

    // تحقق مما إذا كان هذا طلب تكرار منتج (Duplicate)
    if (body.action === "duplicate" && body.id) {
      const original = await prisma.product.findUnique({
        where: { id: body.id }
      });

      if (!original) {
        return NextResponse.json({ error: "المنتج الأصلي المراد تكراره غير موجود." }, { status: 404 });
      }

      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newSlug = `${original.slug}-copy-${randomSuffix}`;
      const newSku = original.sku ? `${original.sku}-COPY-${randomSuffix}` : `SKU-COPY-${randomSuffix}`;
      const newName = `${original.name} (نسخة)`;

      const duplicated = await prisma.product.create({
        data: {
          name: newName,
          slug: newSlug,
          description: original.description,
          price: original.price,
          discountPrice: original.discountPrice,
          sku: newSku,
          brand: original.brand,
          images: original.images,
          stock: original.stock,
          color: original.color,
          aluminumType: original.aluminumType,
          dimensions: original.dimensions,
          weight: original.weight,
          isActive: original.isActive,
          metaTitle: original.metaTitle || newName,
          metaDescription: original.metaDescription || original.description.substring(0, 150),
          categoryId: original.categoryId
        }
      });

      return NextResponse.json({ success: true, product: duplicated });
    }

    // المعالجة العادية لإضافة منتج جديد
    const { 
      name, 
      description, 
      price, 
      discountPrice, 
      sku, 
      brand, 
      images, 
      stock, 
      color, 
      aluminumType, 
      dimensions, 
      weight, 
      isActive, 
      metaTitle, 
      metaDescription, 
      categoryId 
    } = body;

    if (!name || !description || price === undefined || !categoryId || !images) {
      return NextResponse.json({ error: "يرجى تعبئة كافة الحقول الإلزامية." }, { status: 400 });
    }

    // توليد سلوغ فريد تلقائياً من اسم المنتج
    const rawSlug = body.slug ? generateSlug(body.slug) : generateSlug(name);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const finalSlug = `${rawSlug}-${randomSuffix}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        price: Number(price),
        discountPrice: discountPrice !== undefined && discountPrice !== null && discountPrice !== "" ? Number(discountPrice) : null,
        sku: sku || null,
        brand: brand || null,
        images,
        stock: Number(stock) || 0,
        color: color || null,
        aluminumType: aluminumType || null,
        dimensions: dimensions || null,
        weight: weight ? Number(weight) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description.substring(0, 150),
        categoryId
      }
    });

    return NextResponse.json({ success: true, product });

  } catch (error: any) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "فشل إضافة المنتج أو تكراره." }, { status: 500 });
  }
}

// 2. تعديل منتج قائم (PUT)
export async function PUT(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      name, 
      slug, 
      description, 
      price, 
      discountPrice, 
      sku, 
      brand, 
      images, 
      stock, 
      color, 
      aluminumType, 
      dimensions, 
      weight, 
      isActive, 
      metaTitle, 
      metaDescription, 
      categoryId 
    } = body;

    if (!id || !name || !description || price === undefined || !categoryId || !images) {
      return NextResponse.json({ error: "يرجى تعبئة كافة الحقول الإلزامية وتوفير المعرف." }, { status: 400 });
    }

    // معالجة سلوغ معدل أو الافتراضي
    const rawSlug = slug ? generateSlug(slug) : generateSlug(name);
    // نتأكد أنه فريد أو يخص المنتج نفسه
    const slugCheck = await prisma.product.findFirst({
      where: { slug: rawSlug, id: { not: id } }
    });
    const finalSlug = slugCheck ? `${rawSlug}-${Math.floor(10 + Math.random() * 90)}` : rawSlug;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        description,
        price: Number(price),
        discountPrice: discountPrice !== undefined && discountPrice !== null && discountPrice !== "" ? Number(discountPrice) : null,
        sku: sku || null,
        brand: brand || null,
        images,
        stock: Number(stock) || 0,
        color: color || null,
        aluminumType: aluminumType || null,
        dimensions: dimensions || null,
        weight: weight ? Number(weight) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription || description.substring(0, 150),
        categoryId
      }
    });

    return NextResponse.json({ success: true, product });

  } catch (error: any) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "فشل تعديل المنتج." }, { status: 500 });
  }
}

// 3. حذف منتج (DELETE)
export async function DELETE(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب." }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "تم حذف المنتج بنجاح." });

  } catch (error: any) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ error: "فشل حذف المنتج." }, { status: 500 });
  }
}
