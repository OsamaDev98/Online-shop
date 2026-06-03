import React from "react";
import Link from "next/link";
import { FiShield, FiArrowLeft, FiPackage } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { prisma } from "@/lib/db";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { orderIndex: "asc" },
  });

  const categoryEmojis: Record<string, string> = {
    "aluminum-handles": "🚪",
    "aluminum-hinges": "🔩",
    "aluminum-locks": "🔒",
    "sliding-rollers": "⚙️",
    "window-accessories": "🪟",
    "door-closers": "🔄",
  };

  const categoryColors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-purple-500 to-violet-600",
    "from-rose-500 to-pink-600",
    "from-cyan-500 to-sky-600",
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Page hero */}
      <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-16 relative overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `radial-gradient(circle, #d4a017 1px, transparent 1px)`, backgroundSize: "30px 30px" }} />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017] text-xs font-extrabold mb-5">
            <HiSparkles className="w-3.5 h-3.5" />
            تصفح الأقسام
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            إكسسوارات الألومنيوم المقسّمة
          </h1>
          <p className="text-sm text-blue-200/70 font-medium max-w-2xl mx-auto leading-relaxed">
            اختر القسم المناسب لأعمالك لتتمكن من تصفح المقابض والمفصلات والأقفال وحوامل الحركة والعجل الجرار. نوفر مقاسات متعددة لكل فئة.
          </p>
          {/* Stats row */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{categories.length}</p>
              <p className="text-[10px] text-blue-300/70 font-bold">قسم متخصص</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">
                {categories.reduce((sum, c) => sum + c._count.products, 0)}
              </p>
              <p className="text-[10px] text-blue-300/70 font-bold">منتج متاح</p>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L1440 40L1440 10C1080 40 720 0 360 30L0 10L0 40Z" fill="#f8faff" />
          </svg>
        </div>
      </div>

      {/* Categories grid */}
      <div className="container mx-auto px-4 py-16 lg:px-8">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-slate-700">لا توجد أقسام بعد</h3>
            <p className="text-sm text-slate-400 mt-1">ستظهر الأقسام هنا بعد إضافتها من لوحة التحكم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {categories.map((cat, idx) => {
              const emoji = categoryEmojis[cat.slug] || "📦";
              const gradient = categoryColors[idx % categoryColors.length];

              return (
                <div key={cat.id}
                  className="group relative bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-300 transition-all duration-300 hover:-translate-y-0.5">

                  {/* Gradient top stripe */}
                  <div className={`h-1.5 bg-gradient-to-r ${gradient} opacity-90`} />

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <span className="text-3xl">{emoji}</span>
                      </div>

                      {/* Product count badge */}
                      <div className="text-left">
                        <span className="text-2xl font-black text-[#0f1a3e] block">{cat._count.products}</span>
                        <span className="text-[10px] font-bold text-slate-400">منتج متوفر</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <h2 className="text-xl font-black text-[#0f1a3e] group-hover:text-primary-700 transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {cat.description || "تشكيلة متكاملة من الإكسسوارات الفنية لقطاعات الأبواب والشبابيك الألومنيوم."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <FiShield className="w-3.5 h-3.5 text-emerald-500" />
                        جودة مضمونة ومقاومة للرطوبة
                      </span>
                      <Link href={`/shop?category=${cat.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-extrabold text-primary-600 group-hover:text-primary-700 hover:gap-2.5 transition-all">
                        <span>تصفح المنتجات</span>
                        <FiArrowLeft className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA section */}
        <div className="mt-14 text-center">
          <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: `radial-gradient(circle, #d4a017 1px, transparent 1px)`, backgroundSize: "25px 25px" }} />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white mb-3">لم تجد ما تبحث عنه؟</h3>
              <p className="text-sm text-blue-200/70 font-medium mb-6 max-w-md mx-auto">
                تواصل مع فريق الدعم الفني ويسعدنا توفير أي قطعة ألومنيوم أو إكسسوار غير موجود في المتجر.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#d4a017] to-[#f0c84a] text-[#0f1a3e] font-extrabold text-sm shadow-lg hover:shadow-[#d4a017]/30 transition-all">
                  تصفح كل المنتجات
                  <FiArrowLeft className="w-4 h-4" />
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-extrabold text-sm hover:bg-white/15 transition-all">
                  تواصل مع الدعم
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
