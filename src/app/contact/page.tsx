"use client";

import React, { useState } from "react";
import { FiPhone, FiMail, FiMapPin, FiSend, FiMessageSquare, FiClock } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

export default function ContactPage() {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      showToast("تم إرسال رسالتك بنجاح! سيتواصل معك أحد ممثلي الدعم الفني قريباً.", "success");
      setForm({ name: "", email: "", phone: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="text-right" dir="rtl">

      {/* Hero */}
      <section className="relative page-hero py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600')"}} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a3e]/90 to-[#1e2d6e]/80" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017] text-xs font-extrabold mb-5">
            تواصل معنا
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">اتصل بنا</h1>
          <p className="text-base text-blue-100/70 font-medium max-w-xl mx-auto leading-relaxed">
            سواء كنت مقاولاً، مهندس تشطيبات، أو مالك منزل — فريقنا جاهز للرد على كافة استفساراتك وحصر المقاسات مجاناً.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50L1440 50L1440 15C1080 50 720 0 360 35L0 15L0 50Z" fill="#fafbff" />
          </svg>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Contact info */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-extrabold text-[#d4a017] uppercase tracking-widest block mb-3">معلومات الاتصال</span>
              <h2 className="text-2xl font-black text-[#0f1a3e]">تواصل بالطريقة المناسبة لك</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">نوفر قنوات تواصل متعددة لضمان الرد السريع والدقيق.</p>
            </div>

            {/* Contact cards */}
            {[
              { icon: FiPhone, label: "اتصال هاتفي", value: "+20 100 123 4567", sub: "نستقبل مكالماتكم خلال ساعات العمل", href: "tel:+201001234567" },
              { icon: FiMail, label: "بريد إلكتروني", value: "support@aluminum-expert.com", sub: "نلتزم بالرد خلال يوم عمل واحد", href: "mailto:support@aluminum-expert.com" },
              { icon: FiMapPin, label: "المعرض والمقر الرئيسي", value: "المنطقة الصناعية، القاهرة", sub: "يسعدنا استقبالكم لمعاينة المنتجات" },
            ].map(({ icon: Icon, label, value, sub, href }) => (
              <div key={label}>
                {href ? (
                  <a href={href} className="group flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary-200 hover:shadow-md transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f1a3e] to-[#1e2d6e] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-extrabold text-[#0f1a3e] mt-0.5">{value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f1a3e] to-[#1e2d6e] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className="w-4 h-4 text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-extrabold text-[#0f1a3e] mt-0.5">{value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* WhatsApp */}
            <a href="https://wa.me/201012345678" target="_blank" rel="noopener noreferrer"
              className="group flex gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">واتساب — الأسرع</p>
                <p className="text-sm font-extrabold text-emerald-800">+20 10 1234 5678</p>
                <p className="text-[10px] text-emerald-600 mt-0.5">الخيار المفضل لإرسال قوائم المقاسات والتسعير الفوري</p>
              </div>
            </a>

            {/* Business hours */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <FiClock className="w-4 h-4 text-[#d4a017]" />
                ساعات العمل الرسمية
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { days: "السبت → الأربعاء", hours: "9:00 ص – 9:00 م" },
                  { days: "الخميس", hours: "9:00 ص – 6:00 م" },
                  { days: "الجمعة", hours: "🛑 عطلة رسمية" },
                ].map(({ days, hours }) => (
                  <div key={days} className="flex justify-between font-semibold">
                    <span className="text-slate-400">{days}</span>
                    <span className="text-[#0f1a3e] font-extrabold">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8 space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0f1a3e] to-[#1e2d6e] flex items-center justify-center">
                  <FiMessageSquare className="w-4 h-4 text-[#d4a017]" />
                </div>
                <h3 className="text-base font-extrabold text-[#0f1a3e]">إرسال رسالة مباشرة</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">الاسم بالكامل *</label>
                    <input type="text" required name="name" value={form.name} onChange={handleInputChange}
                      placeholder="محمد أحمد علي" className="shadcn-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">رقم الهاتف *</label>
                    <input type="tel" required name="phone" value={form.phone} onChange={handleInputChange}
                      placeholder="010XXXXXXXXX" className="shadcn-input text-left font-mono" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">البريد الإلكتروني *</label>
                  <input type="email" required name="email" value={form.email} onChange={handleInputChange}
                    placeholder="name@example.com" className="shadcn-input text-left" dir="ltr" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">نص الرسالة والاستفسار *</label>
                  <textarea required name="message" rows={5} value={form.message} onChange={handleInputChange}
                    placeholder="أرسل قائمة المقاسات المطلوبة، أو مواصفات قطاع الألوميتال الذي تعمل عليه، أو أي سؤال فني..."
                    className="shadcn-input" />
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="shadcn-btn-primary w-full py-4 text-sm flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري الإرسال...</>
                  ) : (
                    <><span>إرسال الرسالة</span><FiSend className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Map placeholder */}
      <section className="pb-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-extrabold text-[#0f1a3e]">موقع معرضنا ومقرنا الفني</h2>
            <p className="text-sm text-slate-500 mt-1">تفضل بزيارتنا لتفقد الإكسسوارات وتجربتها يدوياً</p>
          </div>
          <div className="relative h-72 sm:h-80 rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center bg-slate-200">
            <div className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a3e]/50 to-transparent" />
            <div className="relative z-10 glass-panel rounded-2xl p-6 text-center space-y-3 shadow-xl mx-4">
              <span className="text-4xl">📍</span>
              <h4 className="text-sm font-extrabold text-[#0f1a3e]">ألومنيوم إكسبرت الرئيسي</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">المنطقة الصناعية الأولى، التجمع الخامس، القاهرة الجديدة.</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                className="shadcn-btn-primary px-4 py-2 text-[11px] inline-flex items-center gap-1.5">
                افتح في خرائط Google 🗺️
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
