import React from "react";
import Link from "next/link";
import { ArrowRight, Info, ShieldCheck, Sparkles, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductActionPanel from "@/components/ProductActionPanel";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true }
      }
    }
  });

  if (!product || !product.isActive) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center">
          <span className="text-3xl">⚠️</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900">المنتج غير موجود</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            عذراً، المنتج الذي تحاول تصفحه غير موجود أو تم إخفاؤه مؤقتاً.
          </p>
        </div>
        <Link
          href="/shop"
          className="shadcn-btn-primary px-6 py-3 inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-slate-50 min-h-screen" dir="rtl">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-[#0f1a3e] transition-colors">الرئيسية</Link>
            <ChevronSep />
            <Link href="/shop" className="hover:text-[#0f1a3e] transition-colors">المتجر</Link>
            <ChevronSep />
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#0f1a3e] transition-colors">
              {product.category.name}
            </Link>
            <ChevronSep />
            <span className="text-slate-700 line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-8 space-y-14">

        {/* Main product section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Gallery */}
          <div className="lg:col-span-6">
            <ProductImageGallery imagesString={product.images} productName={product.name} />
          </div>

          {/* Info + actions */}
          <div className="lg:col-span-6 space-y-6 text-right">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-extrabold text-primary-700">
                <Sparkles className="w-3 h-3" />
                {product.category.name}
              </span>

              <h1 className="text-3xl font-black text-[#0f1a3e] leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                {product.sku && (
                  <span className="text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                    SKU: {product.sku}
                  </span>
                )}
                {product.brand && (
                  <span className="text-slate-400 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                    الماركة: {product.brand}
                  </span>
                )}
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#d4a017] text-[#d4a017]" />
                  ))}
                  <span className="text-slate-400 font-bold mr-1">(4.9)</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed border-r-4 border-[#d4a017] pr-4 bg-amber-50/50 py-3 rounded-l-xl">
              {product.description}
            </p>

            {/* Action panel */}
            <div className="premium-card p-6">
              <ProductActionPanel product={product} />
            </div>
          </div>
        </div>

        {/* Specs table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-600" />
            <h3 className="text-base font-extrabold text-slate-900">المواصفات الفنية</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
              {[
                { label: "خامة الألومنيوم", value: product.aluminumType || "متعدد الاستخدام" },
                { label: "اللون والطلاء", value: product.color || "فضي معدني لامع" },
                { label: "الأبعاد", value: product.dimensions || "أحجام قياسية متوافقة" },
                { label: "الوزن", value: product.weight ? `${product.weight} كجم` : "غير محدد" },
                { label: "رمز المخزون", value: product.sku || "N/A" },
                { label: "الماركة", value: product.brand || "ألومنيوم إكسبرت" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3 border-b border-slate-100 last:border-0 text-sm">
                  <span className="font-bold text-slate-400">{label}:</span>
                  <span className="font-extrabold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <Star className="w-5 h-5 fill-[#d4a017] text-[#d4a017]" />
            <h3 className="text-xl font-extrabold text-slate-900">آراء العملاء</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "م. كريم محمود", rating: 5, date: "قبل 3 أيام", text: "مقبض فخم جداً وملمسه ناعم. استعملته في أبواب ألومنيوم ثقيلة وجاء متناسقاً ومثبتاً بإحكام." },
              { name: "أبو أحمد للألوميتال", rating: 5, date: "قبل أسبوع", text: "كالون ذو أمان ممتاز والسلندر نحاسي ثقيل جداً. الأسعار هنا أفضل من المحلات المحلية." },
              { name: "م. شريف طنطاوي", rating: 4, date: "قبل أسبوعين", text: "الخامات إيطالية ممتازة والشحن للإسكندرية استغرق يومين فقط. التغليف رائع." },
            ].map((rev, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm hover:shadow-md hover:border-primary-200 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#0f1a3e]">{rev.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#d4a017] text-[#d4a017]" />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-slate-500">"{rev.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <Info className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-extrabold text-slate-900">الأسئلة الشائعة</h3>
          </div>
          <div className="space-y-3 max-w-3xl">
            {[
              { q: "هل هذه القطعة مقاومة للصدأ؟", a: "نعم، كافة منتجاتنا مصنوعة من سبائك ألومنيوم فائقة الجودة ومطابقة لأحدث معايير الطلاء الكهربائي." },
              { q: "هل تتوفر مسامير التركيب مع المنتج؟", a: "نعم، تأتي كل قطعة مزودة بكافة مسامير التثبيت اللازمة للتركيب الفوري." },
              { q: "هل تتوفر أسعار خاصة لطلبات الجملة؟", a: "نعم، للطلبات التجارية بكميات كبيرة، تواصل مع الدعم عبر واتساب للحصول على عروض خاصة." },
            ].map((faq, idx) => (
              <details key={idx} className="group border border-slate-200 rounded-2xl bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden cursor-pointer hover:border-primary-200 transition-colors">
                <summary className="flex items-center justify-between text-sm font-bold text-slate-800 p-5 focus:outline-none">
                  <span>{faq.q}</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-lg ml-2">↓</span>
                </summary>
                <p className="text-xs leading-relaxed text-slate-500 px-5 pb-5 pt-0 border-t border-slate-100">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-xl font-extrabold text-[#0f1a3e]">منتجات مشابهة</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">من فئة {product.category.name}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {similarProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ChevronSep() {
  return <span className="text-slate-300 font-light">/</span>;
}
