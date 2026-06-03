import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 0; // إيقاف التخزين المؤقت للبيانات الإدارية حية التحديث

export async function GET(request: Request) {
  try {
    // 1. جلب التصنيفات مرتبة حسب ترتيب الإدارة
    const categories = await prisma.category.findMany({
      orderBy: { orderIndex: "asc" }
    });

    // 2. جلب المنتجات مع بيانات التصنيف التابعة لها
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 3. جلب الطلبات مع تفاصيل منتجاتها وعلاقاتها
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // 4. جلب العملاء المسجلين
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    // 5. جلب الكوبونات
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });

    // 6. جلب إعدادات شحن المحافظات
    const shippingSettings = await prisma.shippingSetting.findMany({
      orderBy: { province: "asc" }
    });

    // 7. جلب محتوى البانر الترحيبي وإعدادات المتجر
    const homepageContent = await prisma.homepageContent.findFirst();
    const siteSetting = await prisma.siteSetting.findFirst();

    // 8. حساب الإحصائيات العامة المتقدمة
    const totalOrders = orders.length;
    
    // المبيعات المكتملة الفعالة (التي تم دفع قيمتها بنجاح في النظام)
    const paidOrders = orders.filter(o => o.paymentStatus === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // المنتجات المنتهية من المخزن
    const outOfStockCount = products.filter(p => p.stock <= 0).length;

    // العملاء المسجلين
    const totalCustomers = users.length;

    return NextResponse.json({
      categories,
      products,
      orders,
      users,
      coupons,
      shippingSettings,
      homepageContent,
      siteSetting,
      stats: {
        totalOrders,
        totalRevenue,
        outOfStockCount,
        totalCustomers,
        totalCoupons: coupons.length
      }
    });

  } catch (error: any) {
    console.error("Admin dashboard data fetch error:", error);
    return NextResponse.json(
      { 
        error: "فشل جلب بيانات لوحة التحكم الإدارية.",
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
