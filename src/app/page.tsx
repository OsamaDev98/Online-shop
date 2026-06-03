import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiShield, FiTruck, FiStar, FiChevronLeft, FiAward, FiZap } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 8,
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({
    take: 6,
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  const stats = [
    { value: "15,000+", label: "عميل سعيد", icon: "😊" },
    { value: "500+", label: "منتج متميز", icon: "📦" },
    { value: "27", label: "محافظة تخدمها", icon: "🗺️" },
    { value: "5+", label: "سنوات خبرة", icon: "⭐" },
  ];

  const testimonials = [
    {
      name: "م. أحمد عبدالله",
      role: "مقاول أعمال ألومنيوم",
      text: "أفضل متجر إلكتروني للإكسسوارات في مصر. الجودة ممتازة والتوصيل سريع لورشتي بالإسكندرية.",
      rating: 5,
    },
    {
      name: "كريم الشافعي",
      role: "مصمم مطابخ",
      text: "وفّر عليّ وقتاً وجهداً كبيراً. المقابض والمفصلات طابقت الكاتالوج بدقة وجودة عالية.",
      rating: 5,
    },
    {
      name: "مصطفى رضوان",
      role: "مورّد إكسسوارات",
      text: "أتعامل معهم منذ سنوات. أسعار الجملة مناسبة وخدمة العملاء ممتازة دائماً.",
      rating: 5,
    },
  ];

  return (
    <div className="text-right" dir="rtl">

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden page-hero py-24 sm:py-32 min-h-[85vh] flex items-center">
        {/* Real hero background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1a3e]/92 via-[#0f1a3e]/80 to-[#1e2d6e]/85" />
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#d4a017]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#f0c84a] text-xs font-bold backdrop-blur-sm">
              <HiSparkles className="w-3.5 h-3.5" />
              <span>الوجهة الأولى لإكسسوارات الألومنيوم في مصر</span>
              <HiSparkles className="w-3.5 h-3.5" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              اكتشف أرقى
              <span className="block mt-1 bg-gradient-to-l from-[#d4a017] to-[#f0c84a] bg-clip-text text-transparent">
                إكسسوارات الألومنيوم
              </span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100/80 leading-relaxed max-w-2xl mx-auto font-medium">
              مقابض، مفصلات، أقفال وعجل جرار بجودة فائقة — لكل أبواب وشبابيك الألومنيوم في مصر. توصيل لجميع المحافظات في 24-48 ساعة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#d4a017] to-[#f0c84a] text-[#0f1a3e] font-extrabold text-sm shadow-2xl shadow-[#d4a017]/30 hover:shadow-[#d4a017]/50 hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>تسوق الآن</span>
                <FiArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-sm hover:bg-white/15 transition-all"
              >
                تتبع طلبك
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4">
              {[
                { icon: FiShield, text: "جودة مضمونة 100%" },
                { icon: FiTruck, text: "شحن لكل مصر" },
                { icon: FiAward, text: "5+ سنوات خبرة" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-200/80">
                  <Icon className="w-3.5 h-3.5 text-[#d4a017]" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 20C1080 80 720 0 360 60L0 20L0 80Z" fill="#fafbff" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl mb-2 transition-transform group-hover:-translate-y-0.5">{stat.icon}</div>
                <div className="text-2xl font-black text-[#0f1a3e]">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CATEGORIES
      ═══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">
                أقسامنا المتميزة
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f1a3e]">
                تصفح حسب الفئة
              </h2>
              <p className="text-slate-500 mt-3 text-sm font-medium max-w-lg mx-auto">
                مئات المنتجات المتخصصة منظمة في فئات واضحة لتسهيل البحث والشراء
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, idx) => {
                const emojis = ["🔩", "🚪", "🔐", "⚙️", "🪟", "✨"];
                return (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">
                      {emojis[idx % emojis.length]}
                    </span>
                    <span className="text-xs font-extrabold text-slate-700 group-hover:text-[#0f1a3e] leading-tight">
                      {cat.name}
                    </span>
                    <span className="mt-1.5 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                      {cat._count.products} منتج
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">
                  منتجات مختارة بعناية
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0f1a3e]">
                  الأكثر مبيعاً
                </h2>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-[#0f1a3e] hover:text-white hover:border-[#0f1a3e] transition-all shadow-sm"
              >
                عرض الكل
                <FiChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          WHY US SECTION
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-br from-[#0f1a3e] to-[#1e2d6e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, #d4a017 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">
              لماذا نحن؟
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              مزايا التسوق من إكسبرت
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "🏆", title: "جودة مضمونة", desc: "منتجات مطابقة للمواصفات الدولية وموثوقة من أفضل المصانع" },
              { icon: "🚀", title: "توصيل سريع", desc: "24-48 ساعة لمعظم المحافظات عبر شبكة توصيل موثوقة" },
              { icon: "💎", title: "أسعار تنافسية", desc: "أفضل أسعار السوق مع خصومات جملة للورش والمقاولين" },
              { icon: "🎧", title: "دعم متميز", desc: "خبراء فنيون جاهزون لمساعدتك في اختيار القطعة المثالية" },
            ].map((item) => (
              <div key={item.title} className="group text-center p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#d4a017]/30 transition-all duration-300">
                <div className="text-4xl mb-4 transition-transform group-hover:-translate-y-1">{item.icon}</div>
                <h3 className="text-base font-extrabold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-blue-200/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">
              آراء عملائنا
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1a3e]">
              ماذا يقول عملاؤنا؟
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-lg hover:shadow-slate-200/60 hover:border-primary-200 transition-all duration-300"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-[#d4a017] text-[#d4a017]" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">"{t.text}"</p>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-sm font-extrabold text-[#0f1a3e]">{t.name}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="py-16 bg-gradient-to-r from-[#d4a017] via-[#f0c84a] to-[#d4a017] animate-gradient">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <FiZap className="w-10 h-10 mx-auto mb-4 text-[#0f1a3e]" />
          <h2 className="text-2xl sm:text-3xl font-black text-[#0f1a3e] mb-4">
            مستعد للطلب؟ تواصل معنا الآن!
          </h2>
          <p className="text-sm text-[#0f1a3e]/70 font-semibold mb-8 max-w-lg mx-auto">
            فريق خبراء الألومنيوم جاهز للإجابة على استفساراتك وتقديم عروض الجملة المخصصة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#0f1a3e] text-white font-extrabold text-sm hover:bg-[#1e2d6e] shadow-lg transition-all"
            >
              تسوق الآن
              <FiArrowLeft className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/30 border border-[#0f1a3e]/20 text-[#0f1a3e] font-extrabold text-sm hover:bg-white/50 transition-all"
            >
              اتصل بنا
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
