import React from "react";
import Link from "next/link";
import { FiAward, FiShield, FiEye, FiCompass, FiHeart, FiArrowLeft } from "react-icons/fi";

export default function AboutPage() {
  const stats = [
    { value: "+10", label: "أعوام خبرة بمصر", icon: "📅" },
    { value: "+5,000", label: "عميل سعيد", icon: "😊" },
    { value: "+300", label: "منتج متوافق", icon: "📦" },
    { value: "100%", label: "ضمان الجودة", icon: "✅" },
  ];

  return (
    <div className="text-right" dir="rtl">

      {/* Hero */}
      <section className="relative page-hero py-24 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200')`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017] text-xs font-extrabold mb-5">
            من نحن
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">ألومنيوم إكسبرت</h1>
          <p className="text-base text-blue-100/70 font-medium max-w-2xl mx-auto leading-relaxed">
            المنصة الأولى والرائدة بمصر في توريد إكسسوارات الألومنيوم والألوميتال الفاخرة للشبابيك والأبواب والواجهات والمطابخ.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L1440 50L1440 15C1080 50 720 0 360 35L0 15L0 50Z" fill="#fafbff" />
          </svg>
        </div>
      </section>

      {/* Story + Stats */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block text-xs font-extrabold text-[#d4a017] uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              قصتنا
            </span>
            <h2 className="text-3xl font-black text-[#0f1a3e] leading-tight">
              نحن لا نبيع مجرد قطع غيار، بل نصنع الحماية والجمال
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              تأسست ألومنيوم إكسبرت بهدف واضح: توفير إكسسوارات ألومنيوم ذات متانة مطلقة وتصميمات فاخرة، تلبي احتياجات المهندسين وأصحاب الورش والملاك في مصر.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              منذ انطلاقنا، نجحنا في بناء سلسلة إمداد موثوقة تجمع بين المكونات الإيطالية المعتمدة والمكونات المحلية فائقة الجودة، لنضمن أن كل مقبض ومفصلة وقفل يعمل لسنوات دون تآكل.
            </p>
            <Link href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] text-white font-bold text-sm shadow-lg hover:shadow-[#0f1a3e]/25 transition-all hover:-translate-y-0.5">
              تسوق الآن
              <FiArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-primary-200 hover:shadow-md transition-all group">
                <div className="text-3xl group-hover:-translate-y-0.5 transition-transform">{stat.icon}</div>
                <h3 className="text-3xl font-black text-[#0f1a3e]">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: FiEye, label: "رؤيتنا",
              text: "أن نكون الوجهة الرقمية الأولى لكافة المهندسين والفنيين والعملاء بمصر للوصول الفوري لمكونات الألوميتال بجودة مطلقة وشفافية رقمية."
            },
            {
              icon: FiCompass, label: "رسالتنا",
              text: "تيسير عملية الشراء وتسهيل الحصول على أفضل المنتجات من خلال متجر إلكتروني ذكي مع ضمان شامل يدعم المتانة والأمان لكافة الأبنية."
            }
          ].map(({ icon: Icon, label, text }) => (
            <div key={label} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f1a3e] to-[#3238a3] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Icon className="w-5 h-5 text-[#d4a017]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0f1a3e]">{label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core values */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">ما يميزنا</span>
            <h2 className="text-3xl font-black text-[#0f1a3e]">قيمنا الجوهرية</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FiAward, title: "الالتزام بالجودة", desc: "لا نساوم أبداً على جودة المعادن ومقاومة الطلاء، ونختبر كل قطعة للتأكد من تحملها لأطول فترة ممكنة." },
              { icon: FiShield, title: "الموثوقية والأمان", desc: "نقدم حلول أمان كاملة وكوالين عالية التقنية تحمي ممتلكات عملائنا بنسبة موثوقة تامة." },
              { icon: FiHeart, title: "رضا العميل أولاً", desc: "نضع رضا عملائنا ودعم الفنيين وأصحاب الورش في قلب كافة قراراتنا اللوجستية والمالية." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all group space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f1a3e] to-[#1e2d6e] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-[#d4a017]" />
                </div>
                <h3 className="text-base font-extrabold text-[#0f1a3e]">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA block */}
      <section className="py-16 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-6">
            <h2 className="text-2xl font-black text-white">لماذا تختار ألومنيوم إكسبرت؟</h2>
            <p className="text-sm text-blue-200/70 max-w-xl mx-auto leading-relaxed font-medium">
              المنصة الوحيدة بمصر التي تجمع بين كفاءة الإكسسوارات المستوردة، ودقة القياسات الفنية لجميع قطاعات الألوميتال، مع بوابات دفع ذكية وضمان شامل.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop" className="shadcn-btn-gold px-8 py-3.5 text-sm inline-flex items-center gap-2">
                تسوق الآن
                <FiArrowLeft className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-all">
                اتصل بنا
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
