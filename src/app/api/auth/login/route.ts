import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// API لتسجيل دخول العميل
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. التحقق من المدخلات
    if (!email || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." },
        { status: 400 }
      );
    }

    // 2. البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // 3. التحقق من صحة كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // 4. إرجاع بيانات الجلسة بنجاح
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم أثناء تسجيل الدخول." },
      { status: 500 }
    );
  }
}
