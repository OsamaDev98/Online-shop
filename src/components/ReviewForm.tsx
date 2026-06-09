"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiStar, FiMessageSquare, FiSend, FiUser } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // ملء اسم العميل تلقائياً إذا كان مسجلاً
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserName(user.name);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast("يرجى كتابة تعليق أولاً.", "error");
      return;
    }
    if (!userName.trim()) {
      showToast("يرجى إدخال اسمك لكتابة التقييم.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
          userName: userName.trim()
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل إرسال التقييم.");

      showToast("نشكرك! تم تسجيل تقييمك بنجاح.", "success");
      setComment("");
      if (!isAuthenticated) {
        setUserName("");
      }
      setRating(5);
      
      // تحديث بيانات الصفحة حية
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "حدث خطأ أثناء إرسال التقييم.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
      <h3 className="text-sm font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
        <FiMessageSquare className="w-4 h-4 text-primary-500" />
        كتابة تقييم ورأي للمنتج
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div className="space-y-1">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">تقييمك بالنجوم *</label>
          <div className="flex gap-1.5 items-center pt-2">
            {[1, 2, 3, 4, 5].map((starIdx) => {
              const active = hoverRating !== null ? starIdx <= hoverRating : starIdx <= rating;
              return (
                <button
                  key={starIdx}
                  type="button"
                  onClick={() => setRating(starIdx)}
                  onMouseEnter={() => setHoverRating(starIdx)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <FiStar
                    className={`w-6 h-6 stroke-[1.5] ${
                      active ? "fill-[#d4a017] text-[#d4a017]" : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-xs text-slate-400 font-bold mr-2">
              ({rating} من 5 نجوم)
            </span>
          </div>
        </div>

        {/* User name input (if not authenticated) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">اسم الكاتب *</label>
          {isAuthenticated ? (
            <div className="flex items-center gap-2 px-4 py-3 border border-slate-100 bg-slate-50 text-slate-500 text-xs rounded-xl font-bold">
              <FiUser className="w-4 h-4 text-slate-400" />
              <span>{userName}</span>
            </div>
          ) : (
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="اكتب اسمك ليظهر على المراجعة"
              className="shadcn-input mt-2"
            />
          )}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">التعليق والملاحظات *</label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتب رأيك وتجربتك الفنية مع المنتج بكل أمانة وموضوعية..."
            className="shadcn-input mt-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="shadcn-btn-primary w-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري تسجيل تقييمك...</>
          ) : (
            <><span>إرسال التقييم</span><FiSend className="w-3.5 h-3.5" /></>
          )}
        </button>
      </form>
    </div>
  );
}
