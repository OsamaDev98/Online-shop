"use client";

import React, { useState } from "react";
import { FiShoppingCart, FiPlus, FiMinus, FiTag, FiHeart, FiShield, FiTruck, FiRotateCcw } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number | null;
  images: string;
  stock: number;
  color?: string | null;
  dimensions?: string | null;
}

export default function ProductActionPanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const activePrice =
    product.discountPrice !== null && product.discountPrice !== undefined
      ? product.discountPrice
      : product.price;
  const hasDiscount =
    product.discountPrice !== null && product.discountPrice !== undefined;
  const savingsPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    } else {
      showToast(`عذراً، الكمية المتوفرة هي ${product.stock} فقط`, "error");
    }
  };
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: activePrice,
      images: product.images,
      stock: product.stock,
      color: product.color,
      dimensions: product.dimensions,
    }, quantity);
  };

  return (
    <div className="space-y-6">

      {/* Price block */}
      <div className="relative bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50 to-transparent rounded-2xl opacity-60" />
        {hasDiscount && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4a017] to-[#f0c84a] text-[#0f1a3e] text-[10px] font-extrabold mb-3 shadow-sm">
            <FiTag className="w-3 h-3" />
            وفّر {savingsPercent}%
          </span>
        )}
        <div className="relative">
          <span className="text-xs text-slate-400 block mb-1">السعر الإجمالي</span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-[#0f1a3e]">
              {(activePrice * quantity).toLocaleString("ar-EG")}
            </span>
            <span className="text-lg font-bold text-slate-500">ج.م</span>
            {hasDiscount && (
              <span className="text-base text-slate-400 line-through">
                {(product.price * quantity).toLocaleString("ar-EG")} ج.م
              </span>
            )}
          </div>
          {quantity > 1 && (
            <span className="text-[11px] text-slate-400 mt-1 block">
              ({activePrice.toLocaleString("ar-EG")} ج.م للقطعة)
            </span>
          )}
        </div>
      </div>

      {product.stock <= 0 ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm font-bold text-center">
          هذا المنتج غير متوفر حالياً في المخزن
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quantity */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-2">الكمية المطلوبة</label>
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-[#0f1a3e] transition-colors"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-base font-extrabold text-[#0f1a3e]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-[#0f1a3e] transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                متوفر: {product.stock} قطعة
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-grow flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] hover:from-[#1e2d6e] hover:to-[#3238a3] text-white font-bold py-4 px-6 text-sm shadow-lg shadow-[#0f1a3e]/20 hover:shadow-[#0f1a3e]/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span>أضف إلى السلة</span>
            </button>

            <button
              onClick={() => {
                const next = !isWishlisted;
                setIsWishlisted(next);
                showToast(next ? "تمت الإضافة للمفضلة" : "تمت الإزالة من المفضلة", "success");
              }}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isWishlisted
                  ? "bg-rose-50 border-rose-300 text-rose-500 scale-105"
                  : "bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400"
              }`}
            >
              <FiHeart className={`w-5 h-5 transition-all ${isWishlisted ? "fill-rose-500" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {[
          { icon: FiShield, label: "ضمان الجودة", sub: "منتجات معتمدة" },
          { icon: FiTruck, label: "شحن سريع", sub: "لكل محافظات مصر" },
          { icon: FiRotateCcw, label: "إرجاع مجاني", sub: "خلال 14 يوم" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5 p-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 leading-tight">{label}</span>
            <span className="text-[9px] text-slate-400 leading-tight">{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
