"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiLogIn,
  FiUserPlus,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
  FiShield,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const redirectPath = searchParams ? searchParams.get("redirect") || "/" : "/";

  useEffect(() => {
    if (isAuthenticated) router.push(redirectPath);
  }, [isAuthenticated, redirectPath, router]);

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setRegisterData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      showToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    setIsSubmitting(true);
    const success = await login(loginData);
    setIsSubmitting(false);
    if (success) router.push(redirectPath);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword } = registerData;
    if (!name || !email || !phone || !password || !confirmPassword) {
      showToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("كلمات المرور غير متطابقة", "error");
      return;
    }
    setIsSubmitting(true);
    const success = await register({ name, email, phone, password });
    setIsSubmitting(false);
    if (success) router.push(redirectPath);
  };

  return (
    <div
      className="min-h-[calc(100vh-130px)] flex items-center justify-center bg-slate-50 py-12 px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#0f1a3e] to-[#3238a3] flex items-center justify-center shadow-xl shadow-[#0f1a3e]/20 mb-4">
            <span className="text-yellow-400 font-black text-2xl">إ</span>
          </div>
          <h1 className="text-2xl font-black text-[#0f1a3e]">
            ألومنيوم إكسبرت
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            {isLoginTab
              ? "مرحباً بعودتك! سجّل دخولك للمتابعة"
              : "انضم إلينا وابدأ التسوق بسهولة"}
          </p>
        </div>

        {/* Redirect notice */}
        {redirectPath !== "/" && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold text-center flex items-center justify-center gap-2">
            <FiShield className="w-4 h-4 text-amber-500 flex-shrink-0" />
            يرجى تسجيل الدخول لإتمام عملية الشراء
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/40 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-extrabold transition-all border-b-2 cursor-pointer ${isLoginTab ? "border-[#0f1a3e] text-[#0f1a3e] bg-white" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <FiLogIn className="w-4 h-4" />
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-extrabold transition-all border-b-2 cursor-pointer ${!isLoginTab ? "border-[#0f1a3e] text-[#0f1a3e] bg-white" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <FiUserPlus className="w-4 h-4" />
              حساب جديد
            </button>
          </div>

          {/* Forms */}
          <div className="p-7 space-y-4">
            {isLoginTab ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <FiMail className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="name@example.com"
                      className="shadcn-input !pr-9 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <FiLock className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="أدخل كلمة المرور..."
                      className="shadcn-input !pr-9"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadcn-btn-primary w-full py-3.5 text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الدخول...
                    </>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="أحمد محمد علي"
                      className="shadcn-input !pr-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      placeholder="name@example.com"
                      className="shadcn-input !pr-9 text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    رقم الهاتف *
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      placeholder="010XXXXXXXXX"
                      className="shadcn-input !pr-9 text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        required
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="••••••"
                        className="shadcn-input !pr-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      التأكيد *
                    </label>
                    <div className="relative">
                      <FiLock className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="••••••"
                        className="shadcn-input !pr-9"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shadcn-btn-primary w-full py-3.5 text-sm mt-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <HiSparkles className="w-4 h-4" />
                      إنشاء حساب جديد
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-6 flex justify-center gap-6">
          {["🔒 تشفير SSL", "🛡️ بيانات محمية", "✅ تسجيل آمن"].map((item) => (
            <span key={item} className="text-[10px] text-slate-400 font-bold">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <span className="h-8 w-8 border-4 border-[#0f1a3e] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
