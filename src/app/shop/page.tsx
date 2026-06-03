import React from "react";
import Link from "next/link";
import { FiSearch, FiFilter, FiRefreshCw, FiX, FiFolder, FiSliders, FiCheckSquare, FiSquare, FiChevronRight, FiChevronLeft, FiPackage } from "react-icons/fi";
import { MdPalette } from "react-icons/md";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    color?: string;
    aluminumType?: string;
    priceRange?: string;
    inStockOnly?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const activeCategory = params.category || "";
  const activeSearch = params.search || "";
  const activeColor = params.color || "";
  const activeAluminumType = params.aluminumType || "";
  const activePriceRange = params.priceRange || "";
  const activeInStockOnly = params.inStockOnly === "true";
  const activeSortBy = params.sortBy || "newest";
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 9;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });

  const rawProductsColors = await prisma.product.findMany({
    select: { color: true },
    where: { color: { not: null }, isActive: true },
  });
  const colors = Array.from(
    new Set(rawProductsColors.map((p: typeof rawProductsColors[number]) => p.color).filter(Boolean))
  ) as string[];

  const rawAluminumTypes = await prisma.product.findMany({
    select: { aluminumType: true },
    where: { aluminumType: { not: null }, isActive: true },
  });
  const aluminumTypes = Array.from(
    new Set(rawAluminumTypes.map((p: typeof rawAluminumTypes[number]) => p.aluminumType).filter(Boolean))
  ) as string[];

  const whereClause: any = { isActive: true };
  if (activeCategory) whereClause.category = { slug: activeCategory };
  if (activeSearch) {
    whereClause.OR = [
      { name: { contains: activeSearch } },
      { description: { contains: activeSearch } },
    ];
  }
  if (activeColor) whereClause.color = activeColor;
  if (activeAluminumType) whereClause.aluminumType = activeAluminumType;
  if (activeInStockOnly) whereClause.stock = { gt: 0 };
  if (activePriceRange) {
    if (activePriceRange === "under-500") whereClause.price = { lt: 500 };
    else if (activePriceRange === "500-1500") whereClause.price = { gte: 500, lte: 1500 };
    else if (activePriceRange === "above-1500") whereClause.price = { gt: 1500 };
  }

  let orderByClause: any = { createdAt: "desc" };
  if (activeSortBy === "price_asc") orderByClause = { price: "asc" };
  else if (activeSortBy === "price_desc") orderByClause = { price: "desc" };
  else if (activeSortBy === "best_selling") orderByClause = { stock: "asc" };

  const totalProducts = await prisma.product.count({ where: whereClause });
  const totalPages = Math.ceil(totalProducts / itemsPerPage) || 1;
  const skip = (currentPage - 1) * itemsPerPage;

  const products = await prisma.product.findMany({
    where: whereClause,
    include: { category: { select: { name: true } } },
    orderBy: orderByClause,
    skip,
    take: itemsPerPage,
  });

  const isAnyFilterActive =
    activeCategory || activeSearch || activeColor || activeAluminumType ||
    activePriceRange || activeInStockOnly || activeSortBy !== "newest";

  const getFilterUrl = (newParams: {
    category?: string; search?: string; color?: string; aluminumType?: string;
    priceRange?: string; inStockOnly?: string; sortBy?: string; page?: string;
  }) => {
    const combined = {
      category: newParams.category !== undefined ? newParams.category : activeCategory,
      search: newParams.search !== undefined ? newParams.search : activeSearch,
      color: newParams.color !== undefined ? newParams.color : activeColor,
      aluminumType: newParams.aluminumType !== undefined ? newParams.aluminumType : activeAluminumType,
      priceRange: newParams.priceRange !== undefined ? newParams.priceRange : activePriceRange,
      inStockOnly: newParams.inStockOnly !== undefined ? newParams.inStockOnly : (activeInStockOnly ? "true" : ""),
      sortBy: newParams.sortBy !== undefined ? newParams.sortBy : activeSortBy,
    };
    const query = new URLSearchParams();
    if (combined.category) query.set("category", combined.category);
    if (combined.search) query.set("search", combined.search);
    if (combined.color) query.set("color", combined.color);
    if (combined.aluminumType) query.set("aluminumType", combined.aluminumType);
    if (combined.priceRange) query.set("priceRange", combined.priceRange);
    if (combined.inStockOnly) query.set("inStockOnly", combined.inStockOnly);
    if (combined.sortBy) query.set("sortBy", combined.sortBy);
    if (newParams.page !== undefined) query.set("page", newParams.page);
    else if (currentPage > 1) query.set("page", currentPage.toString());
    return `/shop?${query.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=1600')"}} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a3e]/90 to-[#1e2d6e]/80" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest block mb-2">
                المتجر الإلكتروني
              </span>
              <h1 className="text-3xl font-black text-white">معرض إكسسوارات الألومنيوم</h1>
              <p className="text-sm text-blue-200/70 mt-1 font-medium">
                {totalProducts} منتج متاح — تصفح وفلتر واطلب بكل سهولة
              </p>
            </div>
            {/* Breadcrumb */}
            <nav className="text-xs font-bold text-blue-300/60 flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
              <span>/</span>
              <span className="text-white">المتجر</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

          {/* ═══ FILTERS SIDEBAR ═══ */}
          <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-24">

            {/* Search */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0f1a3e] mb-3 flex items-center gap-2">
                <FiSearch className="w-4 h-4 text-primary-500" />
                بحث في المنتجات
              </h3>
              <form action="/shop" method="GET" className="relative">
                {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
                {activeColor && <input type="hidden" name="color" value={activeColor} />}
                {activeAluminumType && <input type="hidden" name="aluminumType" value={activeAluminumType} />}
                {activePriceRange && <input type="hidden" name="priceRange" value={activePriceRange} />}
                {activeInStockOnly && <input type="hidden" name="inStockOnly" value="true" />}
                {activeSortBy && <input type="hidden" name="sortBy" value={activeSortBy} />}
                <input
                  type="text" name="search" defaultValue={activeSearch}
                  placeholder="ابحث بالاسم أو الموديل..."
                  className="shadcn-input pr-4 pl-10 text-sm"
                />
                <button type="submit" className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-primary-600 transition-colors">
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0f1a3e] mb-3 flex items-center gap-2">
                <FiFolder className="w-4 h-4 text-primary-500" />
                الأقسام
              </h3>
              <div className="space-y-1">
                <Link href={getFilterUrl({ category: "" })}
                  className={`flex items-center justify-between text-sm p-2.5 rounded-xl font-semibold transition-all ${!activeCategory ? "bg-primary-50 text-primary-700 font-extrabold border border-primary-100" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span>جميع الأقسام</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-bold">{totalProducts}</span>
                </Link>
                {categories.map((cat) => (
                  <Link key={cat.id} href={getFilterUrl({ category: cat.slug })}
                    className={`flex items-center justify-between text-sm p-2.5 rounded-xl font-semibold transition-all ${activeCategory === cat.slug ? "bg-primary-50 text-primary-700 font-extrabold border border-primary-100" : "text-slate-600 hover:bg-slate-50"}`}>
                    <span>{cat.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-bold">{cat._count.products}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0f1a3e] mb-3 flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-primary-500" />
                نطاق الأسعار
              </h3>
              <div className="space-y-1.5">
                {[
                  { label: "جميع الأسعار", value: "" },
                  { label: "أقل من 500 ج.م", value: "under-500" },
                  { label: "500 – 1500 ج.م", value: "500-1500" },
                  { label: "أعلى من 1500 ج.م", value: "above-1500" },
                ].map((range) => (
                  <Link key={range.value} href={getFilterUrl({ priceRange: range.value })}
                    className={`flex items-center gap-2.5 text-sm p-2 rounded-xl transition-all ${activePriceRange === range.value ? "text-primary-700 font-extrabold" : "text-slate-600 hover:bg-slate-50"}`}>
                    {activePriceRange === range.value
                      ? <FiCheckSquare className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      : <FiSquare className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                    {range.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colors */}
            {colors.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] mb-3 flex items-center gap-2">
                  <MdPalette className="w-4 h-4 text-primary-500" />
                  الألوان
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link href={getFilterUrl({ color: "" })}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${!activeColor ? "bg-[#0f1a3e] text-white border-[#0f1a3e]" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    الكل
                  </Link>
                  {colors.map((colorName) => (
                    <Link key={colorName} href={getFilterUrl({ color: colorName })}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${activeColor === colorName ? "bg-primary-600 text-white border-primary-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {colorName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Aluminum Types */}
            {aluminumTypes.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] mb-3 flex items-center gap-2">
                  <FiFilter className="w-4 h-4 text-primary-500" />
                  نوع الألومنيوم
                </h3>
                <div className="space-y-1">
                  <Link href={getFilterUrl({ aluminumType: "" })}
                    className={`flex items-center text-sm p-2.5 rounded-xl font-semibold transition-all ${!activeAluminumType ? "bg-primary-50 text-primary-700 font-extrabold border border-primary-100" : "text-slate-600 hover:bg-slate-50"}`}>
                    الكل
                  </Link>
                  {aluminumTypes.map((type) => (
                    <Link key={type} href={getFilterUrl({ aluminumType: type })}
                      className={`flex items-center text-sm p-2.5 rounded-xl font-semibold transition-all ${activeAluminumType === type ? "bg-primary-50 text-primary-700 font-extrabold border border-primary-100" : "text-slate-600 hover:bg-slate-50"}`}>
                      {type}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* In stock only */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <Link href={getFilterUrl({ inStockOnly: activeInStockOnly ? "" : "true" })}
                className="flex items-center gap-2.5 text-sm font-bold text-slate-700 hover:text-[#0f1a3e] transition-colors">
                {activeInStockOnly
                  ? <FiCheckSquare className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  : <FiSquare className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                المتوفر بالمخزن فقط
              </Link>
            </div>

            {/* Reset */}
            {isAnyFilterActive && (
              <Link href="/shop"
                className="flex items-center justify-center gap-2 w-full p-3 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-extrabold transition-all">
                <FiRefreshCw className="w-4 h-4" />
                إعادة تعيين الفلاتر
              </Link>
            )}
          </aside>

          {/* ═══ PRODUCTS MAIN ═══ */}
          <main className="lg:col-span-9 space-y-5">

            {/* Sort bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-600 font-bold">
                <span className="font-extrabold text-[#0f1a3e]">{totalProducts}</span> منتج مطابق
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-bold whitespace-nowrap">ترتيب حسب:</span>
                {[
                  { label: "الأحدث", value: "newest" },
                  { label: "الأقل سعراً", value: "price_asc" },
                  { label: "الأعلى سعراً", value: "price_desc" },
                  { label: "الأكثر طلباً", value: "best_selling" },
                ].map((opt) => (
                  <Link key={opt.value} href={getFilterUrl({ sortBy: opt.value })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${activeSortBy === opt.value
                      ? "bg-[#0f1a3e] text-white border-[#0f1a3e] shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}>
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Active filter badges */}
            {isAnyFilterActive && (
              <div className="flex flex-wrap gap-2 items-center p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">فلاتر نشطة:</span>
                {activeCategory && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    القسم: {categories.find((c) => c.slug === activeCategory)?.name}
                    <Link href={getFilterUrl({ category: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
                {activeSearch && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    بحث: "{activeSearch}"
                    <Link href={getFilterUrl({ search: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
                {activeColor && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    اللون: {activeColor}
                    <Link href={getFilterUrl({ color: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
                {activeAluminumType && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    المعدن: {activeAluminumType}
                    <Link href={getFilterUrl({ aluminumType: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
                {activePriceRange && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    السعر: {activePriceRange === "under-500" ? "أقل من 500" : activePriceRange === "500-1500" ? "500-1500" : "أعلى من 1500"}
                    <Link href={getFilterUrl({ priceRange: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
                {activeInStockOnly && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    المتوفر فقط
                    <Link href={getFilterUrl({ inStockOnly: "" })} className="text-rose-400 hover:text-rose-600 mr-1"><FiX className="w-3 h-3" /></Link>
                  </span>
                )}
              </div>
            )}

            {/* Products grid */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-5 py-24 bg-white rounded-3xl border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <FiPackage className="w-7 h-7 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800">لم يُعثر على منتجات مطابقة</h3>
                  <p className="text-sm text-slate-400 mt-1">حاول تعديل الفلاتر أو البحث بكلمة مختلفة</p>
                </div>
                <Link href="/shop" className="shadcn-btn-primary px-6 py-2.5 text-sm">
                  تصفح كل المنتجات
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
                {currentPage > 1 ? (
                  <Link href={getFilterUrl({ page: (currentPage - 1).toString() })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center">
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button disabled className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 flex items-center cursor-not-allowed">
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Link key={pageNum} href={getFilterUrl({ page: pageNum.toString() })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all border ${currentPage === pageNum
                      ? "bg-[#0f1a3e] text-white border-[#0f1a3e] shadow-md"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                    {pageNum}
                  </Link>
                ))}

                {currentPage < totalPages ? (
                  <Link href={getFilterUrl({ page: (currentPage + 1).toString() })}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center">
                    <FiChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <button disabled className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 flex items-center cursor-not-allowed">
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
