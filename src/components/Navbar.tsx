"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiShoppingBag, FiMenu, FiX, FiTrash2, FiArrowRight, FiUser, FiLogOut, FiChevronLeft } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  siteSetting?: {
    siteName: string;
    logo?: string | null;
    contactPhone: string;
    contactEmail: string;
    whatsappNumber: string;
    facebookLink?: string | null;
  } | null;
}

export default function Navbar({ siteSetting }: NavbarProps) {
  const pathname = usePathname();
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "المتجر", path: "/shop" },
    { name: "من نحن", path: "/about" },
    { name: "اتصل بنا", path: "/contact" },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <div className="w-full bg-gradient-to-r from-[#0f1a3e] via-[#1e2d6e] to-[#0f1a3e] text-white py-2">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center text-[11px] font-semibold">
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1.5">
              <HiSparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-200">شحن مجاني للطلبات فوق 500 ج.م</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              🕒 ساعات العمل: 9 ص – 9 م
            </span>
          </div>
          <a
            href={`tel:${siteSetting?.contactPhone || "+201012345678"}`}
            className="flex items-center gap-1.5 text-yellow-300 hover:text-yellow-200 font-bold transition-colors"
          >
            📞 {siteSetting?.contactPhone || "+20 10 1234 5678"}
          </a>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src="/logo.svg"
                  alt="شعار ألومنيوم إكسبرت"
                  className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="text-lg font-black tracking-tight text-[#0f1a3e] group-hover:text-[#3238a3] transition-colors">
                  {(() => {
                    const siteName = siteSetting?.siteName || "ألومنيوم إكسبرت";
                    const parts = siteName.split(" ");
                    const first = parts[0];
                    const rest = parts.slice(1).join(" ");
                    return (
                      <>
                        {first} {rest && <span className="text-gold-gradient bg-gradient-to-r from-[#d4a017] to-[#f0c84a] bg-clip-text text-transparent">{rest}</span>}
                      </>
                    );
                  })()}
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                      pathname === link.path
                        ? "text-[#0f1a3e] bg-primary-50"
                        : "text-slate-500 hover:text-[#0f1a3e] hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                    {pathname === link.path && (
                      <span className="absolute bottom-0 right-1/2 translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-[#d4a017] to-[#f0c84a] rounded-full" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Track order */}
              <Link
                href="/track-order"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-[#0f1a3e] hover:bg-slate-50 rounded-xl transition-all"
              >
                تتبع طلبك
              </Link>

              {/* Auth */}
              {isAuthenticated && user ? (
                <div className="hidden sm:flex items-center gap-2 border-r border-slate-200 pr-3">
                  <span className="text-xs font-bold text-slate-600">
                    مرحباً، {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-[#0f1a3e] hover:text-white text-slate-700 border border-slate-200 hover:border-[#0f1a3e] transition-all shadow-xs"
                >
                  <FiUser className="w-3.5 h-3.5" />
                  <span>دخول</span>
                </Link>
              )}

              {/* Cart button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                aria-label="سلة التسوق"
              >
                <FiShoppingBag className="w-5 h-5 text-slate-700 group-hover:text-[#0f1a3e] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-br from-[#d4a017] to-[#f0c84a] text-[9px] font-black text-[#0f1a3e] shadow-sm border border-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl hover:bg-slate-50 md:hidden transition-all cursor-pointer border border-transparent hover:border-slate-200"
                aria-label="فتح القائمة"
              >
                {isMobileMenuOpen
                  ? <FiX className="w-5 h-5 text-slate-700" />
                  : <FiMenu className="w-5 h-5 text-slate-700" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-100 md:hidden bg-white px-4 py-4 flex flex-col gap-1 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  pathname === link.path
                    ? "text-[#0f1a3e] bg-primary-50 border border-primary-100"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              تتبع طلبك
            </Link>
            <div className="border-t border-slate-100 pt-3 mt-1">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-bold text-slate-700">مرحباً، {user.name}</span>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="flex items-center gap-1 text-sm text-rose-500 font-bold cursor-pointer"
                  >
                    <FiLogOut className="w-3.5 h-3.5" />
                    خروج
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] hover:opacity-90 transition-all shadow-md"
                >
                  <FiUser className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#0f1a3e]/40 backdrop-blur-sm z-40"
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 flex max-w-full pr-10 z-50">
            <div className="w-screen max-w-md">
              <div className="flex h-full flex-col bg-white shadow-2xl">

                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e]">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">سلة المشتريات</h2>
                    <p className="text-[10px] text-blue-200 mt-0.5">{cartCount} منتج في السلة</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-12">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <FiShoppingBag className="w-7 h-7 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm">سلتك فارغة</p>
                        <p className="text-xs text-slate-400 mt-1">أضف منتجات لتبدأ التسوق</p>
                      </div>
                      <Link
                        href="/shop"
                        onClick={() => setIsCartOpen(false)}
                        className="shadcn-btn-primary px-6 py-2.5 text-sm"
                      >
                        تصفح المتجر
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-white hover:border-primary-100 hover:shadow-sm transition-all"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                            <img
                              src={item.images.split(",")[0]}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                              {item.color && (
                                <span className="text-[10px] text-slate-400 font-medium">{item.color}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 h-7">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 h-full text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors"
                                >−</button>
                                <span className="px-2 text-xs font-extrabold text-slate-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 h-full text-slate-500 hover:bg-slate-100 text-xs font-bold transition-colors"
                                  disabled={item.quantity >= item.stock}
                                >+</button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold text-[#0f1a3e]">
                                  {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                                </span>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart footer */}
                {cartItems.length > 0 && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-3 bg-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">الإجمالي:</span>
                      <span className="text-base font-black text-[#0f1a3e]">
                        {cartTotal.toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">* رسوم الشحن والضرائب تُحسب عند الدفع</p>
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="shadcn-btn-outline w-full py-2.5 text-sm"
                      >
                        عرض السلة كاملة
                      </Link>
                      <Link
                        href="/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="shadcn-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2"
                      >
                        <span>إتمام الشراء</span>
                        <FiArrowRight className="w-4 h-4 rotate-180" />
                      </Link>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        مواصلة التسوق
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
