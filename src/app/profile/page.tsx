"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiUser, FiPackage, FiMapPin, FiPhone, FiMail, FiEdit, FiCheck, FiChevronLeft, FiCalendar, FiClock, FiShoppingBag, FiLock } from "react-icons/fi";
import { useAuth, UserSession } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface UserProfileDetails extends UserSession {
  address?: string | null;
  province?: string | null;
  city?: string | null;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string;
  };
}

interface Order {
  id: string;
  createdAt: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  status: string;
  paymentStatus: string;
  shippingStatus: string;
  items: OrderItem[];
}

interface ProvinceSetting {
  id: string;
  province: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"account" | "orders">("account");
  const [profile, setProfile] = useState<UserProfileDetails>({ id: "", name: "", email: "", phone: "", address: "", province: "", city: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [provinces, setProvinces] = useState<ProvinceSetting[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);

  // حماية الصفحة وإعادة التوجيه
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      showToast("يرجى تسجيل الدخول أولاً لرؤية حسابك الشخصي.", "error");
      router.push("/login?redirect=/profile");
    }
  }, [isLoading, isAuthenticated, router, showToast]);

  // تعبئة البيانات وجلب المقاطعات والطلبات
  useEffect(() => {
    if (isAuthenticated && user) {
      // تحميل بيانات العميل المحفوظة وتحديث الحقول المخصصة
      const savedUser = localStorage.getItem("aluminum_user_session");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setProfile({
            id: user.id,
            name: parsed.name || user.name,
            email: parsed.email || user.email,
            phone: parsed.phone || user.phone,
            address: parsed.address || "",
            province: parsed.province || "",
            city: parsed.city || "",
          });
        } catch {
          setProfile({ ...user, address: "", province: "", city: "" });
        }
      }

      // جلب المحافظات المتاحة
      const fetchProvinces = async () => {
        try {
          const res = await fetch("/api/shipping");
          if (res.ok) setProvinces(await res.json());
        } catch {}
      };

      // جلب طلبات العميل
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await fetch(`/api/user/profile?userId=${user.id}`);
          if (res.ok) {
            setOrders(await res.json());
          }
        } catch (error) {
          console.error("Error loading profile orders:", error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchProvinces();
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  // الترقيم لطلبات العميل
  const ordersPerPage = 5;
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage);
  const currentOrders = orders.slice(
    (orderCurrentPage - 1) * ordersPerPage,
    orderCurrentPage * ordersPerPage
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          province: profile.province,
          city: profile.city
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "فشل تحديث البيانات.");

      // تحديث جلسة العميل محلياً
      localStorage.setItem("aluminum_user_session", JSON.stringify(result.user));
      showToast("تم تحديث بيانات حسابك وعنوانك بنجاح!", "success");
    } catch (error: any) {
      showToast(error.message || "حدث خطأ أثناء حفظ التحديثات.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const translateStatus = (s: string) => {
    const map: Record<string, { text: string; color: string; bg: string }> = {
      NEW: { text: "طلب جديد", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
      UNDER_REVIEW: { text: "قيد المراجعة الفنية", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
      PREPARING: { text: "قيد التجهيز", color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
      SHIPPED: { text: "تم الشحن 🚚", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
      DELIVERED: { text: "تم التسليم للباب ✅", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-[#3238a3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <span className="text-[#d4a017] text-xs font-extrabold uppercase tracking-widest block mb-2">لوحة العميل</span>
          <h1 className="text-3xl font-black text-white">حسابي الشخصي</h1>
          <p className="text-blue-200/70 text-sm mt-1 font-medium">مرحباً بك، {profile.name}! أدر عناوينك وتابع طلباتك بكل سهولة.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Sidebar */}
          <aside className="lg:col-span-3 space-y-3">
            {[
              { id: "account" as const, label: "بيانات الحساب والعناوين", icon: <FiUser className="w-4 h-4" /> },
              { id: "orders" as const, label: "طلباتي ومشترياتي", icon: <FiPackage className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-right text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#0f1a3e] border-[#0f1a3e] text-white shadow-lg shadow-[#0f1a3e]/10"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Tab Content Column */}
          <main className="lg:col-span-9">
            
            {/* TAB: ACCOUNT DETAILS */}
            {activeTab === "account" && (
              <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                <h3 className="text-base font-extrabold text-[#0f1a3e] flex items-center gap-2 pb-3 border-b border-slate-100">
                  <FiUser className="w-5 h-5 text-primary-500" />
                  تفاصيل وبيانات الحساب
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">الاسم بالكامل *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={profile.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسمك بالكامل"
                      className="shadcn-input mt-2"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">رقم الهاتف *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={profile.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className="shadcn-input text-left font-mono mt-2"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">البريد الإلكتروني (غير قابل للتعديل)</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="shadcn-input text-left mt-2 bg-slate-50 text-slate-400 cursor-not-allowed"
                    dir="ltr"
                  />
                </div>

                <h3 className="text-base font-extrabold text-[#0f1a3e] flex items-center gap-2 pt-4 pb-3 border-b border-slate-100">
                  <FiMapPin className="w-5 h-5 text-primary-500" />
                  عنوان الشحن الافتراضي لتسريع الطلبات
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">المحافظة</label>
                    <select
                      name="province"
                      value={profile.province || ""}
                      onChange={handleInputChange}
                      className="shadcn-select w-full mt-2"
                    >
                      <option value="">اختر المحافظة الافتراضية</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.province}>{p.province}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">المدينة / المركز</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city || ""}
                      onChange={handleInputChange}
                      placeholder="مثال: الدقي، طنطا"
                      className="shadcn-input mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">العنوان بالتفصيل</label>
                  <textarea
                    name="address"
                    rows={3}
                    value={profile.address || ""}
                    onChange={handleInputChange}
                    placeholder="رقم الشقة، الدور، العمارة، اسم الشارع"
                    className="shadcn-input mt-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="shadcn-btn-primary px-8 py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 mr-auto"
                >
                  {updatingProfile ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري الحفظ...</>
                  ) : (
                    <><FiCheck className="w-4 h-4" />حفظ التعديلات</>
                  )}
                </button>
              </form>
            )}

            {/* TAB: ORDERS HISTORY */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                {loadingOrders ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                    <div className="h-8 w-8 border-3 border-[#3238a3] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-semibold">جاري تحميل تاريخ طلباتك...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto">
                      <FiShoppingBag className="w-7 h-7 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">لا توجد طلبات سابقة</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">لم تقم بتسجيل أي طلبات بعد في متجرنا.</p>
                    </div>
                    <button onClick={() => router.push("/shop")} className="shadcn-btn-primary px-6 py-2.5 text-xs">
                      ابدأ التسوق الآن
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentOrders.map((order) => {
                      const statusInfo = translateStatus(order.status);
                      return (
                        <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                          {/* Order Header */}
                          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                                كود الطلب: {order.id.split("-")[0]}...
                              </span>
                              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                <FiCalendar className="w-3.5 h-3.5" />
                                {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-extrabold ${statusInfo.color} ${statusInfo.bg}`}>
                                {statusInfo.text}
                              </span>
                              <span className="inline-flex px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-extrabold">
                                الدفع: {translatePayment(order.paymentStatus)}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-5 divide-y divide-slate-100">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                    <img src={item.product.images.split(",")[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-[#0f1a3e] text-xs leading-tight line-clamp-1">{item.product.name}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                                      {item.price.toLocaleString("ar-EG")} ج.م × {item.quantity}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-extrabold text-slate-700 text-xs whitespace-nowrap">
                                  {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Order Footer Totals */}
                          <div className="bg-slate-50/50 px-5 py-4 border-t border-slate-100 flex justify-between items-center flex-wrap gap-3">
                            <button
                              onClick={() => router.push(`/track-order?orderId=${order.id}`)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>تتبع هذا الطلب تفصيلياً</span>
                              <FiChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 font-extrabold block">الإجمالي الكلي</span>
                              <span className="text-sm font-black text-[#0f1a3e]">
                                {order.totalAmount.toLocaleString("ar-EG")} ج.م
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* الترقيم (Pagination) */}
                    {totalOrderPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4" dir="ltr">
                        <button
                          onClick={() => setOrderCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={orderCurrentPage === 1}
                          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 flex items-center justify-center bg-white"
                          title="الصفحة السابقة"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                          </svg>
                        </button>

                        <div className="flex gap-1.5">
                          {Array.from({ length: totalOrderPages }, (_, index) => {
                            const pageNum = index + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setOrderCurrentPage(pageNum)}
                                className={`w-9 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                  orderCurrentPage === pageNum
                                    ? "bg-[#0f1a3e] text-white shadow-md shadow-[#0f1a3e]/10"
                                    : "border border-slate-200 text-slate-655 hover:bg-slate-50 bg-white"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => setOrderCurrentPage((prev) => Math.min(prev + 1, totalOrderPages))}
                          disabled={orderCurrentPage === totalOrderPages}
                          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer text-slate-600 flex items-center justify-center bg-white"
                          title="الصفحة التالية"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
