import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// جلب طلبات المستخدم الحالية
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب." }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Fetch profile orders error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الطلبات." }, { status: 500 });
  }
}

// تحديث بيانات المستخدم وعنوانه الافتراضي
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, phone, address, province, city } = body;

    if (!userId) {
      return NextResponse.json({ error: "معرف المستخدم مطلوب للتحديث." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        province,
        city
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        province: true,
        city: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث بيانات الحساب." }, { status: 500 });
  }
}
