import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// API لتسجيل حساب عميل جديد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // 1. التحقق من المدخلات
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة." },
        { status: 400 }
      );
    }

    // 2. التحقق من صحة البريد الإلكتروني ورقم الهاتف
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "يرجى إدخال بريد إلكتروني صحيح." },
        { status: 400 }
      );
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "يرجى إدخال رقم هاتف مصري صحيح." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن لا تقل عن 6 رموز." },
        { status: 400 }
      );
    }

    // 3. التحقق من عدم تسجيل البريد مسبقاً
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مسجل بالفعل." },
        { status: 400 }
      );
    }

    // 4. تشفير كلمة المرور بشكل آمن
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword
      }
    });

    // 6. إرجاع النتيجة (دون كلمة المرور)
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
    console.error("Register API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي في الخادم أثناء التسجيل." },
      { status: 500 }
    );
  }
}
