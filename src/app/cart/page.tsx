"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiShoppingBag, FiTrash2, FiArrowRight, FiMinus, FiPlus, FiMapPin, FiArrowLeft, FiInfo } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [selectedGovernorate, setSelectedGovernorate] = useState("cairo");

  const shippingFees: Record<string, { name: string; fee: number }> = {
    cairo: { name: "القاهرة والجيزة", fee: 50 },
    alexandria: { name: "الإسكندرية والدلتا", fee: 70 },
    canal: { name: "مدن القناة وسيناء", fee: 80 },
    upper: { name: "محافظات الصعيد", fee: 100 },
  };

  const activeShipping = shippingFees[selectedGovernorate] || { name: "", fee: 50 };
  const vatAmount = cartTotal * 0.14;
  const finalTotal = cartTotal + activeShipping.fee + vatAmount;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">

      {/* Page header */}
      <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-10">
        <div className="container mx-auto px-4 lg:px-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest block mb-2">سلة التسوق</span>
            <h1 className="text-3xl font-black text-white">مراجعة الطلب</h1>
            <p className="text-blue-200/70 text-sm mt-1 font-medium">تحقق من منتجاتك قبل إتمام الدفع</p>
          </div>
          <Link href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all">
            <FiArrowRight className="w-4 h-4" />
            مواصلة التسوق
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-8">

        {cartItems.length === 0 ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <FiShoppingBag className="w-9 h-9 text-slate-300" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">سلتك فارغة!</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                أضف منتجات من متجرنا للبدء في رحلة التسوق
              </p>
            </div>
            <Link href="/shop" className="shadcn-btn-primary px-8 py-3.5 text-sm inline-flex items-center gap-2">
              <FiArrowLeft className="w-4 h-4" />
              تصفح المتجر
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Cart items */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-base font-extrabold text-[#0f1a3e] flex items-center gap-2">
                  <FiShoppingBag className="w-4 h-4" />
                  المنتجات ({cartItems.length})
                </h2>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-6">المنتج</div>
                  <div className="col-span-2 text-center">السعر</div>
                  <div className="col-span-2 text-center">الكمية</div>
                  <div className="col-span-2 text-left">الإجمالي</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-12 sm:col-span-6 flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 bg-white flex-shrink-0 shadow-sm">
                          <img src={item.images.split(",")[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#0f1a3e] line-clamp-2">{item.name}</h4>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {item.color && <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{item.color}</span>}
                            {item.dimensions && <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{item.dimensions}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-2 text-right sm:text-center">
                        <span className="sm:hidden text-[10px] text-slate-400 font-bold block mb-1">السعر</span>
                        <span className="text-sm font-extrabold text-[#0f1a3e]">{item.price.toLocaleString("ar-EG")} ج.م</span>
                      </div>

                      <div className="col-span-4 sm:col-span-2 flex items-center sm:justify-center">
                        <div className="inline-flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-white h-9">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 h-full text-slate-500 hover:bg-slate-50 hover:text-[#0f1a3e] transition-colors">
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-extrabold text-[#0f1a3e]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="px-2.5 h-full text-slate-500 hover:bg-slate-50 hover:text-[#0f1a3e] transition-colors disabled:opacity-40">
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="col-span-4 sm:col-span-2 flex items-center sm:justify-end gap-3">
                        <span className="text-sm font-extrabold text-[#0f1a3e]">{(item.price * item.quantity).toLocaleString("ar-EG")} ج.م</span>
                        <button onClick={() => removeFromCart(item.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-semibold leading-relaxed">
                <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                السعر يشمل الضريبة على القيمة المضافة 14%. رسوم الشحن تُحسب بناءً على محافظتك.
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 space-y-5">

              {/* Shipping estimate */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiMapPin className="w-4 h-4 text-primary-500" />
                  تقدير الشحن
                </h3>
                <div>
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">اختر محافظتك</label>
                  <select value={selectedGovernorate} onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="shadcn-select w-full text-sm font-bold text-slate-700">
                    <option value="cairo">القاهرة والجيزة (50 ج.م)</option>
                    <option value="alexandria">الإسكندرية والدلتا (70 ج.م)</option>
                    <option value="canal">مدن القناة وسيناء (80 ج.م)</option>
                    <option value="upper">محافظات الصعيد (100 ج.م)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  الشحن المقدر إلى {activeShipping.name}:
                  <span className="font-extrabold text-[#0f1a3e] mr-1">{activeShipping.fee} ج.م</span>
                </p>
              </div>

              {/* Summary totals */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1a3e] pb-3 border-b border-slate-100">ملخص الفاتورة</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>إجمالي المنتجات:</span>
                    <span className="font-extrabold text-[#0f1a3e]">{cartTotal.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>رسوم الشحن:</span>
                    <span className="font-extrabold text-[#0f1a3e]">{activeShipping.fee.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-semibold">
                    <span>ضريبة القيمة المضافة (14%):</span>
                    <span className="font-extrabold text-[#0f1a3e]">{vatAmount.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t-2 border-slate-100">
                    <div>
                      <span className="text-base font-extrabold text-[#0f1a3e] block">الإجمالي النهائي</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">شامل الضرائب والشحن</span>
                    </div>
                    <span className="text-xl font-black text-[#0f1a3e]">{finalTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م</span>
                  </div>
                </div>

                <Link href="/checkout"
                  className="shadcn-btn-primary w-full py-4 text-sm flex items-center justify-center gap-2">
                  <span>إتمام الشراء</span>
                  <FiArrowLeft className="w-4 h-4" />
                </Link>

                <div className="text-center">
                  <Link href="/shop" className="text-[10px] text-slate-400 hover:text-slate-600 font-bold transition-colors">
                    مواصلة التسوق
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
