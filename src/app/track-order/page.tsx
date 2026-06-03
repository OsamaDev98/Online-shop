"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiSearch, FiClipboard, FiPackage, FiCreditCard, FiTruck, FiCalendar, FiShoppingBag, FiAlertTriangle, FiCheckCircle, FiCopy, FiCheck } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

interface TrackedItem {
  id: string; productId: string; productName: string;
  productImage: string; quantity: number; price: number;
}

interface TrackedOrder {
  id: string; customerName: string; customerPhone: string;
  shippingAddress: string; province: string; city: string; notes: string;
  totalAmount: number; shippingFee: number; discountAmount: number;
  couponCode: string | null; status: string; paymentStatus: string;
  shippingStatus: string; createdAt: string; items: TrackedItem[];
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const initialOrderId = searchParams.get("orderId") || "";
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/orders/track?orderId=${id.trim()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل جلب تفاصيل الطلب.");
      setOrder(data);
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع."); setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (initialOrderId) fetchOrderDetails(initialOrderId); }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) { showToast("يرجى إدخال كود الطلب أولاً.", "error"); return; }
    router.push(`/track-order?orderId=${orderIdInput.trim()}`);
  };

  const orderSteps = [
    { key: "NEW", label: "طلب جديد", desc: "تم استلام الطلب" },
    { key: "UNDER_REVIEW", label: "مراجعة المقاسات", desc: "جاري مراجعة طلبك" },
    { key: "PREPARING", label: "قيد التجهيز", desc: "تجهيز وتغليف الطلب" },
    { key: "SHIPPED", label: "تم الشحن", desc: "جاري التوصيل" },
    { key: "DELIVERED", label: "تم التسليم", desc: "تم التوصيل بنجاح" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED") return -1;
    return orderSteps.findIndex((step) => step.key === status);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  const translateStatus = (s: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      NEW: { text: "طلب جديد", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      UNDER_REVIEW: { text: "قيد المراجعة", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
      PREPARING: { text: "قيد التجهيز", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
      SHIPPED: { text: "تم الشحن", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
      DELIVERED: { text: "تم التسليم", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
      CANCELLED: { text: "ملغي", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
    };
    return map[s] || { text: s, color: "text-slate-700", bg: "bg-slate-50 border-slate-200" };
  };

  const translatePayment = (p: string) => {
    const map: Record<string, string> = {
      PENDING: "انتظار الدفع", PAID: "تم الدفع ✅", FAILED: "فشل الدفع", REFUNDED: "تم الاسترداد",
    };
    return map[p] || p;
  };

  const translateShipping = (s: string) => {
    const map: Record<string, string> = {
      PREPARING: "جاري التجهيز", IN_TRANSIT: "في الطريق إليك 🚚", DELIVERED: "تم التسليم ✅",
    };
    return map[s] || s;
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Page header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-12">
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=1600')"}} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a3e]/90 to-[#1e2d6e]/80" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative">
          <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest block mb-2">تتبع الطلب</span>
          <h1 className="text-3xl font-black text-white mb-2">تتبع حالة طلبك</h1>
          <p className="text-sm text-blue-200/70 font-medium max-w-md mx-auto">
            أدخل رقم الطلب للاطلاع على حالته التفصيلية في الوقت الفعلي
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 hidden">
          <svg viewBox="0 0 1440 40" fill="none"><path d="M0 40L1440 40L1440 10C1080 40 720 0 360 30L0 10L0 40Z" fill="#fafbff" /></svg>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 space-y-8 max-w-4xl">

        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="أدخل كود الطلب UUID هنا..."
                className="w-full pr-12 pl-4 py-4 border-2 border-slate-200 focus:border-[#6175f1] rounded-2xl bg-white text-slate-800 focus:outline-none transition-all text-sm font-mono shadow-sm"
                dir="ltr" />
            </div>
            <button type="submit" disabled={loading}
              className="shadcn-btn-primary px-6 py-4 text-sm rounded-2xl flex-shrink-0">
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="h-10 w-10 border-4 border-[#6175f1] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-semibold mt-4">جاري قراءة بيانات الطلب...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-lg mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-5 flex gap-3">
            <FiAlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-rose-800">لم يُعثر على الطلب</h4>
              <p className="text-xs text-rose-600 leading-relaxed mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Order details */}
        {order && !loading && (
          <div className="space-y-6 animate-fade-in-up">

            {/* Meta info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: FiClipboard, label: "كود الطلب", value: <span className="font-mono text-xs break-all select-all text-[#0f1a3e]">{order.id}</span> },
                { icon: FiCalendar, label: "تاريخ التسجيل", value: new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) },
                { icon: FiPackage, label: "العميل", value: `${order.customerName} (${order.customerPhone})` },
                { icon: FiTruck, label: "الوجهة", value: `${order.province} — ${order.city}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-extrabold uppercase tracking-wider">
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                  <p className="text-sm font-extrabold text-slate-700">{value}</p>
                </div>
              ))}
            </div>

            {/* Progress tracker */}
            {order.status !== "CANCELLED" ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiTruck className="w-4 h-4 text-[#d4a017]" />
                  مراحل تنفيذ الطلب
                </h3>
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-2 pt-2">
                  {/* Track line */}
                  <div className="hidden md:block absolute top-[27px] right-8 left-8 h-0.5 bg-slate-100 z-0" />
                  {currentStepIdx >= 0 && (
                    <div className="hidden md:block absolute top-[27px] right-8 h-0.5 bg-gradient-to-l from-emerald-500 to-[#3238a3] z-0 transition-all duration-700"
                      style={{ width: `${(currentStepIdx / (orderSteps.length - 1)) * 88}%` }} />
                  )}
                  {orderSteps.map((step, idx) => {
                    const isDone = idx < currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    return (
                      <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10 text-right md:text-center w-full md:w-auto">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-extrabold text-sm flex-shrink-0 transition-all ${
                          isDone ? "bg-emerald-500 border-emerald-500 text-white shadow-md" :
                          isActive ? "bg-[#3238a3] border-[#3238a3] text-white shadow-md shadow-[#3238a3]/30 animate-pulse" :
                          "bg-white border-slate-200 text-slate-400"
                        }`}>
                           {isDone ? <FiCheckCircle className="w-4 h-4 stroke-[2.5]" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-xs font-extrabold ${isActive ? "text-[#3238a3]" : isDone ? "text-emerald-600" : "text-slate-400"}`}>{step.label}</p>
                          <p className="text-[9px] text-slate-400 leading-tight md:max-w-[100px] mx-auto mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center gap-3 text-rose-700">
                <FiAlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-base">هذا الطلب ملغي</h4>
                  <p className="text-sm leading-relaxed mt-0.5">تم إلغاء الطلب. تواصل مع الدعم الفني للاستفسار.</p>
                </div>
              </div>
            )}

            {/* Status badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "حالة الطلب", value: translateStatus(order.status).text, style: translateStatus(order.status) },
                { label: "حالة الدفع", value: translatePayment(order.paymentStatus), icon: FiCreditCard, style: null },
                { label: "حالة الشحن", value: translateShipping(order.shippingStatus), icon: FiTruck, style: null },
              ].map(({ label, value, style }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">{label}</span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl border text-xs font-extrabold ${style ? `${style.color} ${style.bg}` : "text-[#0f1a3e] bg-slate-50 border-slate-200"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Items table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                <FiShoppingBag className="w-4 h-4 text-slate-400" />
                محتويات الطلب
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-sm py-3 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl border border-slate-100 overflow-hidden bg-slate-50">
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[#0f1a3e] text-xs">{item.productName}</p>
                        <p className="text-[9px] text-slate-400">{item.price.toLocaleString("ar-EG")} ج.م / قطعة</p>
                      </div>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <span className="font-extrabold text-[#0f1a3e] text-xs block">{item.quantity} وحدة</span>
                      <span className="text-[9px] text-slate-400">{(item.price * item.quantity).toLocaleString("ar-EG")} ج.م</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-sm max-w-xs mr-auto">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>إجمالي المنتجات:</span>
                  <span>{(order.totalAmount - order.shippingFee + order.discountAmount).toLocaleString("ar-EG")} ج.م</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>الشحن:</span>
                  <span>{order.shippingFee.toLocaleString("ar-EG")} ج.م</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>خصم ({order.couponCode}):</span>
                    <span>- {order.discountAmount.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-[#0f1a3e] text-base pt-2 border-t border-slate-100">
                  <span>الإجمالي:</span>
                  <span>{order.totalAmount.toLocaleString("ar-EG")} ج.م</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#6175f1] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
