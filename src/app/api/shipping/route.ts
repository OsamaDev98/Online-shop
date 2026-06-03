import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const settings = await prisma.shippingSetting.findMany({
      where: { isActive: true },
      orderBy: { province: "asc" }
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Public shipping settings API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات الشحن." },
      { status: 500 }
    );
  }
}
