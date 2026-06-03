"use client";

import React from "react";
import Link from "next/link";
import { FiShoppingCart, FiEye, FiTag, FiStar } from "react-icons/fi";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  images: string;
  stock: number;
  color?: string | null;
  dimensions?: string | null;
  category?: { name: string } | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const firstImage =
    product.images.split(",")[0] ||
    "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=600";

  const hasDiscount =
    product.discountPrice !== null && product.discountPrice !== undefined;
  const activePrice = hasDiscount ? product.discountPrice! : product.price;
  const savingsPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 hover:border-primary-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 text-right">

      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={firstImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-[#d4a017] to-[#f0c84a] text-[#0f1a3e] text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-md z-10">
            <FiTag className="w-2.5 h-2.5" />
            خصم {savingsPercent}%
          </span>
        )}
        {product.stock <= 0 ? (
          <span className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md z-10">
            نفذت الكمية
          </span>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse z-10">
            كمية محدودة ({product.stock})
          </span>
        ) : null}

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1.5 w-full py-2 px-4 bg-white/95 backdrop-blur-sm rounded-xl text-xs font-bold text-[#0f1a3e] hover:bg-white shadow-md transition-all"
          >
            <FiEye className="w-3.5 h-3.5" />
            عرض التفاصيل
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          {product.category && (
            <span className="text-[9px] font-bold text-[#d4a017] uppercase tracking-widest block mb-1">
              {product.category.name}
            </span>
          )}

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#0f1a3e] transition-colors line-clamp-2 leading-relaxed">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {(product.color || product.dimensions) && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {product.color && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {product.color}
                </span>
              )}
              {product.dimensions && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {product.dimensions}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#0f1a3e]">
                {activePrice.toLocaleString("ar-EG")}
              </span>
              <span className="text-xs text-slate-400 font-bold">ج.م</span>
            </div>
            {hasDiscount && (
              <span className="text-[10px] text-slate-400 line-through">
                {product.price.toLocaleString("ar-EG")} ج.م
              </span>
            )}
          </div>

          <button
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: activePrice,
                images: product.images,
                stock: product.stock,
                color: product.color,
                dimensions: product.dimensions,
              }, 1)
            }
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              product.stock <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] text-white hover:shadow-md hover:shadow-[#0f1a3e]/25 hover:-translate-y-0.5"
            }`}
          >
            <FiShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stock <= 0 ? "نفذ" : "أضف"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
