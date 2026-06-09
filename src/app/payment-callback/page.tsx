"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiShoppingBag, FiPhone, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { showToast } = useToast();

  const success = searchParams.get("success");
  const pending = searchParams.get("pending");
  const paymobOrderId = searchParams.get("order");
  const transactionId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePaymentResult = async () => {
      // 1. حالة نجاح عملية الدفع الفعلي
      if (success === "true" && pending === "false" && paymobOrderId) {
        try {
          // جلب كود الطلب المحلي من قاعدة البيانات
          const res = await fetch(`/api/orders/by-paymob?paymobOrderId=${paymobOrderId}`);
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error || "فشل التحقق من الطلب.");

          // مسح السلة لأن الطلب تم دفعه بنجاح
          clearCart();
          showToast("تم الدفع وتأكيد طلبك بنجاح!", "success");
          
          // التوجيه لصفحة النجاح
          router.push(`/order-success?orderId=${data.orderId}`);
        } catch (e: any) {
          console.error(e);
          setError(e.message || "حدث خطأ أثناء جلب تفاصيل الطلب المدفوع.");
          setLoading(false);
        }
      } 
      // 2. الدفع معلق (بانتظار الإيداع أو فوري)
      else if (pending === "true" && paymobOrderId) {
        try {
          const res = await fetch(`/api/orders/by-paymob?paymobOrderId=${paymobOrderId}`);
          const data = await res.json();
          
          if (res.ok) {
            clearCart();
            showToast("الطلب في انتظار إتمام الدفع (معلق).", "info");
            router.push(`/order-success?orderId=${data.orderId}`);
          } else {
            setLoading(false);
          }
        } catch {
          setLoading(false);
        }
      }
      // 3. فشل الدفع الإلكتروني
      else {
        setLoading(false);
      }
    };

    handlePaymentResult();
  }, [success, pending, paymobOrderId, router, clearCart, showToast]);

  // شاشة التحميل والتحقق من المعاملة
  if (loading) {
    return (
      <div className="text-center py-24 space-y-4">
        <div className="h-12 w-12 border-4 border-[#3238a3] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-bold">جاري التحقق من عملية الدفع وتحديث طلبك...</p>
      </div>
    );
  }

  // شاشة فشل الدفع أو الخطأ الفني
  return (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center bg-rose-50 border border-rose-200 rounded-3xl">
        <FiXCircle className="w-10 h-10 text-rose-500" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-[#0f1a3e]">
          {error ? "خطأ في التحقق من الدفع" : "فشلت عملية الدفع الإلكتروني"}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
          {error 
            ? error 
            : "عذراً، لم تكتمل عملية الدفع الإلكتروني. يرجى مراجعة رصيد بطاقتك أو المحفظة والمحاولة مجدداً."}
        </p>
      </div>

      {transactionId && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-500">
          رقم المعاملة المالي: {transactionId}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Link href="/checkout" className="shadcn-btn-primary py-3 text-xs font-extrabold flex items-center justify-center gap-2">
          <FiRefreshCw className="w-4 h-4" />
          <span>الرجوع والدفع مرة أخرى</span>
        </Link>
        <a 
          href="https://wa.me/201012345678" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-all"
        >
          <FiPhone className="w-4 h-4 text-emerald-600" />
          تواصل مع الدعم الفني عبر واتساب
        </a>
        <Link href="/shop" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-2">
          العودة للمتجر وتصفح المنتجات
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      <Suspense fallback={
        <div className="text-center py-24">
          <div className="h-10 w-10 border-4 border-[#3238a3] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
