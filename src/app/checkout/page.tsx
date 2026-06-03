"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCreditCard, FiShoppingBag, FiArrowLeft, FiTruck, FiShield, FiCheck, FiX, FiTag } from "react-icons/fi";
import { HiShieldExclamation } from "react-icons/hi";
import { BsWallet2 } from "react-icons/bs";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface ProvinceSetting {
  id: string;
  province: string;
  cost: number;
  deliveryDays: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems, cartTotal, clearCart,
    appliedCoupon, applyCoupon, removeCoupon,
    shippingProvince, shippingFee, updateShippingProvince,
    discountAmount, finalTotal,
  } = useCart();
  const { showToast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [provinces, setProvinces] = useState<ProvinceSetting[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", province: "", city: "", notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet" | "cod" | "fawry">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/api/shipping");
        if (res.ok) setProvinces(await res.json());
        else setProvinces([
          { id: "1", province: "القاهرة والجيزة", cost: 50, deliveryDays: "1-2 يوم" },
          { id: "2", province: "الإسكندرية", cost: 70, deliveryDays: "2-3 أيام" },
        ]);
      } catch { }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast("يرجى تسجيل الدخول أولاً", "error");
      router.push("/login?redirect=/checkout");
    } else if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone,
      }));
    }
  }, [isAuthenticated, isLoading, user, router, showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "province") {
      const selected = provinces.find((p) => p.province === value);
      if (selected) updateShippingProvince(selected.province, selected.cost);
      else updateShippingProvince("", 0);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCodeInput.trim());
    setIsApplyingCoupon(false);
    if (success) setCouponCodeInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push("/login?redirect=/checkout"); return; }
    if (cartItems.length === 0) { showToast("السلة فارغة!", "error"); return; }
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.province) {
      showToast("يرجى ملء جميع الحقول المطلوبة", "error"); return;
    }
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      showToast("يرجى إدخال رقم هاتف مصري صحيح", "error"); return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, paymentMethod,
          couponCode: appliedCoupon?.code || null,
          userId: user?.id,
          items: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل في إتمام الطلب");
      if (result.paymentUrl) {
        showToast("جاري توجيهك لبوابة الدفع...", "info");
        window.location.href = result.paymentUrl;
        return;
      }
      clearCart();
      showToast("تم تسجيل طلبك بنجاح!");
      router.push(`/order-success?orderId=${result.orderId}`);
    } catch (error: any) {
      showToast(error.message || "حدث خطأ ما", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest block mb-2">الدفع والشحن</span>
          <h1 className="text-3xl font-black text-white">إتمام الشراء</h1>
          <p className="text-blue-200/70 text-sm mt-1 font-medium">أدخل بيانات التوصيل واختر طريقة الدفع المناسبة</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-8">
        {cartItems.length === 0 ? (
          <div className="max-w-md mx-auto py-16 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <FiShoppingBag className="w-7 h-7 text-slate-300" />
            </div>
            <h3 className="font-extrabold text-slate-800">السلة فارغة</h3>
            <Link href="/shop" className="shadcn-btn-primary px-6 py-3 inline-flex">تصفح المنتجات</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Form column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">

              {/* Shipping info */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiTruck className="w-4 h-4 text-primary-500" />
                  بيانات التوصيل والشحن
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">الاسم بالكامل *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                      placeholder="محمود أحمد علي" className="shadcn-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">رقم الهاتف *</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                      placeholder="01XXXXXXXXX" className="shadcn-input text-left font-mono" dir="ltr" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">البريد الإلكتروني *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                    placeholder="name@example.com" className="shadcn-input text-left" dir="ltr" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">المحافظة *</label>
                    <select name="province" required value={formData.province} onChange={handleInputChange} className="shadcn-select w-full">
                      <option value="">اختر المحافظة</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.province}>{p.province} ({p.cost} ج.م)</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">المدينة / المركز *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleInputChange}
                      placeholder="مثال: الدقي، طنطا" className="shadcn-input" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">العنوان بالتفصيل *</label>
                  <textarea name="address" required rows={2} value={formData.address} onChange={handleInputChange}
                    placeholder="رقم الشقة، الدور، العمارة، اسم الشارع" className="shadcn-input" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ملاحظات إضافية (اختياري)</label>
                  <textarea name="notes" rows={2} value={formData.notes} onChange={handleInputChange}
                    placeholder="أي تعليمات خاصة بالمندوب" className="shadcn-input" />
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiCreditCard className="w-4 h-4 text-primary-500" />
                  طريقة الدفع
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: "card" as const, label: "بطاقة بنكية", sub: "فيزا / ماستر / ميزة", icon: <FiCreditCard className="w-5 h-5 text-[#0f1a3e]" /> },
                    { value: "wallet" as const, label: "محفظة ذكية", sub: "فودافون كاش / اتصالات", icon: <BsWallet2 className="w-5 h-5 text-emerald-600" /> },
                    { value: "fawry" as const, label: "فوري Fawry", sub: "منافذ الدفع", icon: <span className="w-5 h-5 text-amber-600 font-black text-sm flex items-center justify-center bg-amber-50 rounded-full border border-amber-200">F</span> },
                    { value: "cod" as const, label: "الدفع عند الاستلام", sub: "كاش عند الاستلام", icon: <FiTruck className="w-5 h-5 text-slate-500" /> },
                  ].map((opt) => (
                    <label key={opt.value}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer transition-all gap-2 text-center ${paymentMethod === opt.value
                        ? "border-[#0f1a3e] bg-primary-50 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"}`}>
                      <input type="radio" name="paymentMethod" value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)} className="sr-only" />
                      {opt.icon}
                      <div>
                        <p className="text-[11px] font-extrabold text-[#0f1a3e]">{opt.label}</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="shadcn-btn-primary w-full py-4 text-sm font-extrabold flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري معالجة طلبك...</>
                ) : (
                  <><span>تأكيد الطلب وإتمام الدفع</span><FiArrowLeft className="w-4 h-4" /></>
                )}
              </button>
            </form>

            {/* Order summary column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiShoppingBag className="w-4 h-4 text-primary-500" />
                  ملخص الطلب
                </h3>

                {/* Items list */}
                <div className="max-h-52 overflow-y-auto space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center gap-3 text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2.5 flex-grow">
                        <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                          <img src={item.images.split(",")[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0f1a3e] text-[12px] truncate">{item.name}</p>
                          {item.color && <p className="text-[9px] text-slate-400">{item.color}</p>}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">× {item.quantity}</span>
                      <span className="font-extrabold text-[#0f1a3e] text-xs flex-shrink-0">{(item.price * item.quantity).toLocaleString("ar-EG")} ج.م</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-b border-slate-100 py-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <FiTag className="w-3.5 h-3.5 text-[#d4a017]" />
                    كوبون الخصم
                  </div>
                  {!appliedCoupon ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input type="text" value={couponCodeInput} onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="أدخل الكود هنا..." className="shadcn-input flex-grow text-xs uppercase tracking-widest font-bold" />
                      <button type="submit" disabled={isApplyingCoupon || !couponCodeInput}
                        className="shadcn-btn-gold px-4 text-xs disabled:opacity-50">
                        {isApplyingCoupon ? "..." : "تطبيق"}
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                        <FiCheck className="w-4 h-4 text-emerald-600" />
                        تم تطبيق "{appliedCoupon.code}"
                      </div>
                      <button type="button" onClick={removeCoupon}
                        className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 cursor-pointer">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 text-sm font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>إجمالي المنتجات:</span>
                    <span className="font-extrabold text-[#0f1a3e]">{cartTotal.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                  {shippingProvince && (
                    <div className="flex justify-between text-slate-500">
                      <span>الشحن ({shippingProvince}):</span>
                      <span className="font-extrabold text-[#0f1a3e]">{shippingFee.toLocaleString("ar-EG")} ج.م</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-extrabold">
                      <span>خصم الكوبون:</span>
                      <span>- {discountAmount.toLocaleString("ar-EG")} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-[#0f1a3e] pt-3 border-t-2 border-slate-100">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-lg">{finalTotal.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                </div>

                {/* Paymob notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5">
                  <HiShieldExclamation className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                    الدفع آمن 100% ومشفر عبر Paymob. بياناتك لا تخزن على خوادمنا.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
