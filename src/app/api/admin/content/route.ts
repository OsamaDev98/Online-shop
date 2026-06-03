import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// 1. جلب محتوى الصفحة الرئيسية (GET)
// نجعل الجلب عاماً ليقرأه المتجر الإلكتروني بحرية
export async function GET() {
  try {
    const content = await prisma.homepageContent.findFirst();
    return NextResponse.json(content || {
      heroTitle: "ألومنيوم إكسبرت - إكسسوارات الألومنيوم الفاخرة",
      heroSubtitle: "بوابتك للحصول على أفضل المقابض، الأقفال، المفصلات، والعجل الجرار في مصر.",
      heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200",
      ctaText: "تصفح المنتجات",
      ctaLink: "/shop"
    });
  } catch (error) {
    console.error("Public content fetch error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب محتوى الصفحة الرئيسية." },
      { status: 500 }
    );
  }
}

// 2. تحديث محتوى البانر الترحيبي للمدير (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { heroTitle, heroSubtitle, heroImage, ctaText, ctaLink } = body;

    if (!heroTitle || !heroSubtitle || !heroImage) {
      return NextResponse.json({ error: "العنوان والوصف الفرعي وصورة البانر إلزامية." }, { status: 400 });
    }

    const existing = await prisma.homepageContent.findFirst();

    let content;
    if (existing) {
      content = await prisma.homepageContent.update({
        where: { id: existing.id },
        data: { heroTitle, heroSubtitle, heroImage, ctaText: ctaText || "تصفح المنتجات", ctaLink: ctaLink || "/shop" }
      });
    } else {
      content = await prisma.homepageContent.create({
        data: { heroTitle, heroSubtitle, heroImage, ctaText: ctaText || "تصفح المنتجات", ctaLink: ctaLink || "/shop" }
      });
    }

    return NextResponse.json({ success: true, content });

  } catch (error) {
    console.error("Admin content update error:", error);
    return NextResponse.json({ error: "فشل تحديث محتوى الصفحة الرئيسية." }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  return POST(request);
}
