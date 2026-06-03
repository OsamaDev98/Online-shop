"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiCheck, FiCopy, FiShoppingBag, FiArrowLeft, FiHeart, FiPackage } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { useToast } from "@/context/ToastContext";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    showToast("تم نسخ كود الطلب!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4" dir="rtl">
      <div className="w-full max-w-lg text-center space-y-8">

        {/* Success icon */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
          <div className="absolute inset-2 bg-emerald-400/10 rounded-full" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <FiCheck className="w-12 h-12 text-white stroke-[3]" />
          </div>
          {/* Gold sparkles */}
          <HiSparkles className="absolute -top-1 -right-1 w-6 h-6 text-[#d4a017] animate-float" />
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f1a3e]">
            تم استلام طلبك بنجاح! 🎉
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
            شكراً لثقتك بـ <strong>ألومنيوم إكسبرت</strong>! جاري البدء في مراجعة طلبك وتجهيزه بأسرع وقت.
          </p>
        </div>

        {/* Order ID card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-7 space-y-5 text-right">
          <div className="space-y-2">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">رقم تتبع الطلب</span>
            <div className="flex items-center justify-between gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
              <span className="font-mono text-xs sm:text-sm font-bold text-[#0f1a3e] select-all break-all">
                {orderId || "ألومنيوم-إكسبرت-طلب-نشط"}
              </span>
              <button onClick={handleCopyId} disabled={!orderId}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-[#0f1a3e] rounded-xl transition-all cursor-pointer flex-shrink-0">
                {copied ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">حالة الطلب</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
                <FiPackage className="w-3 h-3" />
                جديد (NEW)
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">توقيت التسجيل</span>
              <span className="text-xs font-bold text-[#0f1a3e]">الآن — جاري التحديث</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 text-right">
          <FiHeart className="w-5 h-5 text-[#d4a017] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-[#0f1a3e]">ماذا سيحدث بعد ذلك؟</h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              ستصلك مكالمة تأكيدية من فريقنا للتحقق من تفاصيل المقاسات وعنوان الشحن، ثم يتم تسليم الشحنة لشركة التوصيل للوصول إليك سريعاً.
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/track-order?orderId=${orderId}`}
            className="shadcn-btn-primary px-7 py-3.5 text-sm inline-flex items-center gap-2">
            <FiPackage className="w-4 h-4" />
            تتبع طلبك
          </Link>
          <Link href="/shop"
            className="shadcn-btn-outline px-7 py-3.5 text-sm inline-flex items-center gap-2">
            <FiShoppingBag className="w-4 h-4" />
            مواصلة التسوق
          </Link>
        </div>

        {/* Stars */}
        <p className="text-xs text-slate-400 font-semibold">
          ⭐⭐⭐⭐⭐ شكراً لاختيارك ألومنيوم إكسبرت
        </p>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#6175f1] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
