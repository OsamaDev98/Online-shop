import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// دالة التحقق من رمز الإدارة
function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin_aluminum_2026";
  return authHeader === expectedPassword;
}

// 1. جلب إعدادات الموقع العامة (GET)
// نجعل الجلب عاماً ليقرأه المتجر في الهيدر والفوتر والـ SEO
export async function GET() {
  try {
    const setting = await prisma.siteSetting.findFirst();
    return NextResponse.json(setting || {
      siteName: "ألومنيوم إكسبرت",
      logo: "",
      contactPhone: "+201012345678",
      contactEmail: "support@aluminum-expert.com",
      whatsappNumber: "+201012345678",
      facebookLink: "https://facebook.com/aluminum.expert",
      metaTitle: "ألومنيوم إكسبرت | متجر إكسسوارات الألومنيوم الأول في مصر",
      metaDescription: "تسوق أفضل إكسسوارات الأبواب والشبابيك الألومنيوم في مصر."
    });
  } catch (error) {
    console.error("Public settings fetch error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب إعدادات الموقع." },
      { status: 500 }
    );
  }
}

// 2. تحديث إعدادات الموقع للمدير (POST)
export async function POST(request: Request) {
  try {
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: "غير مصرح بالدخول." }, { status: 401 });
    }

    const body = await request.json();
    const { siteName, logo, contactPhone, contactEmail, whatsappNumber, facebookLink, metaTitle, metaDescription } = body;

    if (!siteName || !contactPhone || !contactEmail || !whatsappNumber) {
      return NextResponse.json({ error: "اسم المتجر، رقم الهاتف، البريد، ورقم الواتساب إلزامية." }, { status: 400 });
    }

    const existing = await prisma.siteSetting.findFirst();

    let setting;
    if (existing) {
      setting = await prisma.siteSetting.update({
        where: { id: existing.id },
        data: { siteName, logo: logo || null, contactPhone, contactEmail, whatsappNumber, facebookLink: facebookLink || null, metaTitle: metaTitle || siteName, metaDescription: metaDescription || "" }
      });
    } else {
      setting = await prisma.siteSetting.create({
        data: { siteName, logo: logo || null, contactPhone, contactEmail, whatsappNumber, facebookLink: facebookLink || null, metaTitle: metaTitle || siteName, metaDescription: metaDescription || "" }
      });
    }

    return NextResponse.json({ success: true, setting });

  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json({ error: "فشل تحديث إعدادات الموقع." }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  return POST(request);
}
