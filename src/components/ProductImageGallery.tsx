"use client";

import React, { useState } from "react";
import { FiZoomIn } from "react-icons/fi";

interface ProductImageGalleryProps {
  imagesString: string;
  productName: string;
}

export default function ProductImageGallery({ imagesString, productName }: ProductImageGalleryProps) {
  const images = imagesString.split(",").filter(Boolean);
  const fallback = "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=600";
  const [activeImage, setActiveImage] = useState(images[0] || fallback);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-lg group">
        <img
          src={activeImage}
          alt={productName}
          className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-103"
        />
        {/* Zoom hint */}
        <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
            <FiZoomIn className="w-3 h-3" />
            تكبير
          </div>
        </div>
        {/* Gold corner accent */}
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#d4a017] rounded-tr-lg opacity-60" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#d4a017] rounded-bl-lg opacity-60" />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                activeImage === img
                  ? "border-[#d4a017] shadow-md shadow-[#d4a017]/20 scale-95"
                  : "border-slate-200 hover:border-primary-300 hover:shadow-sm"
              }`}
            >
              <img
                src={img}
                alt={`${productName} - ${idx + 1}`}
                className="h-full w-full object-cover object-center"
              />
              {activeImage === img && (
                <div className="absolute inset-0 bg-[#d4a017]/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
