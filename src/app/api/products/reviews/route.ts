import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// إنشاء تقييم جديد للمنتج
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, rating, comment, userName } = body;

    // التحقق من صحة المدخلات
    if (!productId || !rating || !comment || !userName) {
      return NextResponse.json(
        { error: "بيانات التقييم غير مكتملة." },
        { status: 400 }
      );
    }

    const ratingVal = Number(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { error: "التقييم يجب أن يكون قيمة رقمية بين 1 و 5 نجوم." },
        { status: 400 }
      );
    }

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "المنتج المحدد غير موجود." },
        { status: 404 }
      );
    }

    // حفظ التقييم في قاعدة البيانات
    const review = await prisma.review.create({
      data: {
        productId,
        rating: ratingVal,
        comment,
        userName: userName.trim()
      }
    });

    return NextResponse.json({
      success: true,
      review
    });

  } catch (error: any) {
    console.error("Create product review error API:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء تسجيل تقييمك." },
      { status: 500 }
    );
  }
}
