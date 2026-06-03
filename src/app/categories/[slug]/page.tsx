import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiChevronLeft, FiFolder, FiSliders, FiCheckSquare, FiSquare, FiChevronRight, FiX, FiRefreshCw } from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0; // إيقاف التخزين المؤقت للمعلومات الحيوية

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    color?: string;
    priceRange?: string;
    page?: string;
  }>;
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const activeColor = resolvedSearchParams.color || "";
  const activePriceRange = resolvedSearchParams.priceRange || "";
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const itemsPerPage = 6;

  // 1. جلب القسم ومعلوماته الأساسية
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  if (!category) {
    notFound();
  }

  // 2. جلب الألوان المتوفرة في هذا القسم تحديداً ديناميكياً
  const rawProductsColors = await prisma.product.findMany({
    select: { color: true },
    where: { categoryId: category.id, color: { not: null }, isActive: true }
  });
  const colors = Array.from(new Set(rawProductsColors.map((p: typeof rawProductsColors[number]) => p.color).filter(Boolean))) as string[];

  // 3. بناء الفلاتر
  const whereClause: any = {
    categoryId: category.id,
    isActive: true
  };

  if (activeColor) {
    whereClause.color = activeColor;
  }

  if (activePriceRange) {
    if (activePriceRange === "under-500") {
      whereClause.price = { lt: 500 };
    } else if (activePriceRange === "500-1500") {
      whereClause.price = { gte: 500, lte: 1500 };
    } else if (activePriceRange === "above-1500") {
      whereClause.price = { gt: 1500 };
    }
  }

  // 4. حساب الترقيم
  const totalProducts = await prisma.product.count({ where: whereClause });
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const skip = (currentPage - 1) * itemsPerPage;

  // 5. جلب المنتجات الفعلية
  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take: itemsPerPage
  });

  const isAnyFilterActive = activeColor || activePriceRange;

  // دالة مساعدة لإنشاء روابط الفلاتر
  const getFilterUrl = (newParams: { color?: string; priceRange?: string; page?: string }) => {
    const combined = {
      color: newParams.color !== undefined ? newParams.color : activeColor,
      priceRange: newParams.priceRange !== undefined ? newParams.priceRange : activePriceRange,
      page: newParams.page !== undefined ? newParams.page : "1",
    };

    const query = new URLSearchParams();
    if (combined.color) query.set("color", combined.color);
    if (combined.priceRange) query.set("priceRange", combined.priceRange);
    if (newParams.page !== undefined) {
      query.set("page", newParams.page);
    } else if (currentPage > 1) {
      query.set("page", currentPage.toString());
    }

    return `/categories/${slug}?${query.toString()}`;
  };

  // صور تعبيرية جميلة للأقسام بناء على نوعها
  const bannerImage = 
    slug === "aluminum-handles" ? "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1200" :
    slug === "aluminum-hinges" ? "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200" :
    slug === "aluminum-locks" ? "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1200" :
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 text-right bg-slate-50">
      
      {/* 1. بنر التصنيف (Category Banner) */}
      <section className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[280px] flex items-center mb-8 shadow-sm">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${bannerImage}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
        <div className="relative p-6 sm:p-10 text-white space-y-3 z-10">
          <Link href="/shop" className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-300 hover:text-primary-200 transition-colors mb-2">
            <span>العودة للمعرض العام</span>
            <FiChevronLeft className="w-3.5 h-3.5" />
          </Link>
          <h1 className="text-2xl sm:text-3.5xl font-extrabold">{category.name}</h1>
          
          {/* 2. وصف التصنيف (Category Description) */}
          <p className="text-sm sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {category.description || "تصفح أحدث تشكيلة من المكونات المتوافقة ومقاومة التآكل في قطاعات الألوميتال."}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3. خيارات التصفية (Filter Options) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* صندوق الأقسام للمقارنة والوصول السريع */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FiFolder className="w-4 h-4 text-slate-400" />
              <span>تصفح قسم آخر</span>
            </h3>
            <div className="space-y-1">
              <Link
                href="/shop"
                className="flex items-center justify-between text-sm p-2.5 rounded-xl text-slate-655 hover:bg-slate-50 font-semibold"
              >
                <span>جميع الأقسام العامة</span>
              </Link>
            </div>
          </div>

          {/* فلاتر الأسعار */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-slate-400" />
              <span>نطاق السعر</span>
            </h3>
            <div className="space-y-2">
              {[
                { label: "الكل", value: "" },
                { label: "أقل من 500 ج.م", value: "under-500" },
                { label: "500 - 1500 ج.م", value: "500-1500" },
                { label: "أعلى من 1500 ج.م", value: "above-1500" }
              ].map((range) => (
                <Link
                  key={range.value}
                  href={getFilterUrl({ priceRange: range.value })}
                  className={`flex items-center gap-2 text-sm p-1.5 rounded-lg hover:bg-slate-50 transition-colors
                    ${activePriceRange === range.value ? "text-primary-600 font-bold" : "text-slate-600"}`}
                >
                  {activePriceRange === range.value ? (
                    <FiCheckSquare className="w-4 h-4 text-primary-600" />
                  ) : (
                    <FiSquare className="w-4 h-4 text-slate-350" />
                  )}
                  <span>{range.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* فلاتر الألوان */}
          {colors.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MdPalette className="w-4 h-4 text-slate-400" />
                <span>اللون</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={getFilterUrl({ color: "" })}
                  className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-all
                    ${!activeColor
                      ? "bg-slate-900 text-white border-slate-950"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  الكل
                </Link>
                {colors.map((colorName) => (
                  <Link
                    key={colorName}
                    href={getFilterUrl({ color: colorName })}
                    className={`text-sm px-3 py-1.5 rounded-lg border font-medium transition-all
                      ${activeColor === colorName
                        ? "bg-primary-600 text-white border-primary-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {colorName}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* زر إعادة ضبط للفلاتر */}
          {isAnyFilterActive && (
            <Link
              href={`/categories/${slug}`}
              className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold transition-all"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>مسح الفلاتر النشطة</span>
            </Link>
          )}

        </aside>

        {/* 4. قائمة المنتجات والترقيم (Product Listing & Pagination) */}
        <main className="lg:col-span-9 space-y-6">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
            <p className="text-sm text-slate-500 font-semibold">
              تم العثور على <span className="font-bold text-slate-900">{totalProducts}</span> منتج في قسم {category.name}
            </p>
          </div>

          {/* المنتجات المعثور عليها */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-20 bg-white rounded-3xl border border-slate-200">
              <span className="text-6xl">🔍</span>
              <div>
                <h3 className="font-extrabold text-slate-800">لا توجد قطع مطابقة</h3>
                <p className="text-sm text-slate-500 mt-1">تأكد من إزالة الفلاتر لعرض كافة محتويات القسم.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {/* ترقيم الصفحات (Pagination) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-200">
              
              {/* زر السابق */}
              {currentPage > 1 ? (
                <Link
                  href={getFilterUrl({ page: (currentPage - 1).toString() })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center"
                >
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-350 cursor-not-allowed flex items-center justify-center" disabled>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* أرقام الصفحات */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={getFilterUrl({ page: pageNumber.toString() })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all border
                    ${currentPage === pageNumber
                      ? "bg-primary-600 text-white border-primary-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
                >
                  {pageNumber}
                </Link>
              ))}

              {/* زر التالي */}
              {currentPage < totalPages ? (
                <Link
                  href={getFilterUrl({ page: (currentPage + 1).toString() })}
                  className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </Link>
              ) : (
                <button className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-350 cursor-not-allowed flex items-center justify-center" disabled>
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
