"use client";

import React, { useState, useEffect } from "react";
import {
  FiLock,
  FiGrid,
  FiPackage,
  FiShoppingCart,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiTrendingUp,
  FiFileText,
  FiAlertTriangle,
  FiLogOut,
  FiX,
  FiRefreshCw,
  FiFolder,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiSettings,
  FiHelpCircle,
  FiCheckCircle,
  FiTruck,
  FiImage,
  FiGlobe,
  FiCopy,
  FiCheck,
  FiEye,
  FiTag,
  FiSearch,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  sku?: string | null;
  brand?: string | null;
  images: string;
  stock: number;
  color?: string | null;
  aluminumType?: string | null;
  dimensions?: string | null;
  weight?: number | null;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId: string;
  category?: { name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  orderIndex: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  province?: string | null;
  city?: string | null;
  notes?: string | null;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string | null;
  status: string; // NEW, UNDER_REVIEW, PREPARING, SHIPPED, DELIVERED, CANCELLED
  paymentStatus: string; // PENDING, PAID, FAILED, REFUNDED
  shippingStatus: string; // PREPARING, IN_TRANSIT, DELIVERED
  paymobOrderId?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  expiryDate?: string | null;
}

interface ShippingSetting {
  id: string;
  province: string;
  cost: number;
  deliveryDays?: string | null;
  isActive: boolean;
}

interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  ctaText: string;
  ctaLink: string;
}

interface SiteSetting {
  siteName: string;
  logo?: string | null;
  contactPhone: string;
  contactEmail: string;
  whatsappNumber: string;
  facebookLink?: string | null;
  metaTitle: string;
  metaDescription: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  outOfStockCount: number;
  totalCustomers: number;
  totalCoupons: number;
}

type TabType =
  | "analytics"
  | "products"
  | "categories"
  | "orders"
  | "users"
  | "coupons"
  | "shipping"
  | "content"
  | "settings";

export default function AdminDashboard() {
  const { showToast } = useToast();

  // حالات الأمان والمصادقة
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // حالات البيانات
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shippingSettings, setShippingSettings] = useState<ShippingSetting[]>(
    [],
  );
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    ctaText: "",
    ctaLink: "",
  });
  const [siteSetting, setSiteSetting] = useState<SiteSetting>({
    siteName: "",
    logo: "",
    contactPhone: "",
    contactEmail: "",
    whatsappNumber: "",
    facebookLink: "",
    metaTitle: "",
    metaDescription: "",
  });
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    outOfStockCount: 0,
    totalCustomers: 0,
    totalCoupons: 0,
  });

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("analytics");

  // حالات البحث والترقيم لتبويب الطلبات
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);

  // تصفية الطلبات بناءً على البحث وحالة الطلب
  const filteredOrders = orders.filter((order) => {
    const searchLower = orderSearchQuery.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(searchLower) ||
      order.customerName.toLowerCase().includes(searchLower) ||
      (order.customerPhone && order.customerPhone.includes(orderSearchQuery)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchLower)) ||
      (order.province && order.province.toLowerCase().includes(searchLower)) ||
      (order.city && order.city.toLowerCase().includes(searchLower)) ||
      (order.paymobOrderId && order.paymobOrderId.includes(orderSearchQuery));

    const matchesStatus =
      orderStatusFilter === "ALL" || order.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // الترقيم للطلبات المصفاة
  const ordersPerPage = 8;
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // حصر الطلبات المعروضة في الصفحة الحالية
  const indexOfLastOrder = orderCurrentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderSearchQuery(e.target.value);
    setOrderCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrderStatusFilter(e.target.value);
    setOrderCurrentPage(1);
  };

  // حالات النوافذ المنبثقة (Modals)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [editingShipping, setEditingShipping] =
    useState<ShippingSetting | null>(null);

  // حالة نماذج البيانات (Form States)
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    sku: "",
    brand: "",
    stock: "",
    categoryId: "",
    images: "",
    color: "",
    aluminumType: "",
    dimensions: "",
    weight: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    orderIndex: "0",
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderAmount: "0",
    isActive: true,
    expiryDate: "",
  });

  const [shippingForm, setShippingForm] = useState({
    province: "",
    cost: "",
    deliveryDays: "",
    isActive: true,
  });

  const [contentForm, setContentForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    ctaText: "",
    ctaLink: "",
  });

  const [settingsForm, setSettingsForm] = useState({
    siteName: "",
    logo: "",
    contactPhone: "",
    contactEmail: "",
    whatsappNumber: "",
    facebookLink: "",
    metaTitle: "",
    metaDescription: "",
  });

  // التحقق من وجود رمز مرور محفوظ مسبقاً في الجلسة
  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin_auth_token");
    if (savedToken) {
      setAuthToken(savedToken);
      verifyAndLoad(savedToken);
    }
  }, []);

  // دالة المصادقة وجلب البيانات
  const verifyAndLoad = async (token: string) => {
    setIsVerifying(true);
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/admin/data", {
        headers: { Authorization: token },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details
            ? `${data.error} (${data.details})`
            : data.error || "فشل تسجيل الدخول.",
        );
      }

      setAuthToken(token);
      sessionStorage.setItem("admin_auth_token", token);
      setIsAuthenticated(true);

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setOrders(data.orders || []);
      setUsers(data.users || []);
      setCoupons(data.coupons || []);
      setShippingSettings(data.shippingSettings || []);

      if (data.homepageContent) {
        setHomepageContent(data.homepageContent);
        setContentForm(data.homepageContent);
      }

      if (data.siteSetting) {
        setSiteSetting(data.siteSetting);
        setSettingsForm(data.siteSetting);
      }

      setStats(
        data.stats || {
          totalOrders: 0,
          totalRevenue: 0,
          outOfStockCount: 0,
          totalCustomers: 0,
          totalCoupons: 0,
        },
      );
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "رمز المرور غير صحيح.", "error");
      sessionStorage.removeItem("admin_auth_token");
      setAuthToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsVerifying(false);
      setIsLoadingData(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      showToast("يرجى إدخال رمز المرور.", "error");
      return;
    }
    verifyAndLoad(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth_token");
    setAuthToken(null);
    setIsAuthenticated(false);
    setPassword("");
    showToast("تم تسجيل الخروج بنجاح.");
  };

  // ======================== إدارة المنتجات ========================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      slug: "",
      description: "",
      price: "",
      discountPrice: "",
      sku: "",
      brand: "",
      stock: "",
      categoryId: categories[0]?.id || "",
      images:
        "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=600",
      color: "فضي",
      aluminumType: "ألومنيوم 6063",
      dimensions: "",
      weight: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      sku: product.sku || "",
      brand: product.brand || "",
      stock: String(product.stock),
      categoryId: product.categoryId,
      images: product.images,
      color: product.color || "",
      aluminumType: product.aluminumType || "",
      dimensions: product.dimensions || "",
      weight: product.weight ? String(product.weight) : "",
      isActive: product.isActive,
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.price ||
      !productForm.categoryId ||
      !productForm.images
    ) {
      showToast("يرجى تعبئة كافة الحقول الإلزامية.", "error");
      return;
    }

    try {
      const isEditing = !!editingProduct;
      const url = "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? { id: editingProduct.id, ...productForm }
        : productForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء حفظ المنتج.");
      }

      showToast(
        isEditing ? "تم تعديل المنتج بنجاح!" : "تم إضافة المنتج بنجاح!",
      );
      setIsProductModalOpen(false);
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ ما.", "error");
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ action: "duplicate", id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل تكرار المنتج.");
      }

      showToast("تم نسخ وتكرار المنتج بنجاح كمسودة جديدة!");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل تكرار المنتج.", "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!authToken) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟")) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل حذف المنتج.");
      }

      showToast("تم حذف المنتج بنجاح.");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل حذف المنتج.", "error");
    }
  };

  // ======================== إدارة الأقسام ========================
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      orderIndex: String(categories.length),
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      orderIndex: String(cat.orderIndex),
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    if (!categoryForm.name || !categoryForm.slug) {
      showToast("الاسم والمعرّف اللطيف مطلوبان.", "error");
      return;
    }

    try {
      const isEditing = !!editingCategory;
      const url = "/api/admin/categories";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء حفظ القسم.");
      }

      showToast(isEditing ? "تم تعديل القسم بنجاح!" : "تم إضافة القسم بنجاح!");
      setIsCategoryModalOpen(false);
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ ما.", "error");
    }
  };

  const handleMoveCategoryOrder = async (
    cat: Category,
    direction: "up" | "down",
  ) => {
    if (!authToken) return;
    const currentIndex = categories.findIndex((c) => c.id === cat.id);
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === categories.length - 1) return;

    const swapTarget =
      direction === "up"
        ? categories[currentIndex - 1]
        : categories[currentIndex + 1];

    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          orderIndex: swapTarget.orderIndex,
        }),
      });

      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({
          id: swapTarget.id,
          name: swapTarget.name,
          slug: swapTarget.slug,
          orderIndex: cat.orderIndex,
        }),
      });

      showToast("تم تحديث ترتيب الأقسام بنجاح!");
      verifyAndLoad(authToken);
    } catch (error) {
      showToast("فشل تحديث ترتيب الأقسام.", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!authToken) return;
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا القسم؟")) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل حذف القسم.");
      }

      showToast("تم حذف القسم بنجاح.");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل حذف القسم.", "error");
    }
  };

  // ======================== إدارة الطلبات والمبيعات ========================
  const handleOrderStateUpdate = async (
    orderId: string,
    updates: {
      status?: string;
      paymentStatus?: string;
      shippingStatus?: string;
    },
  ) => {
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify({ id: orderId, ...updates }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل تحديث حالة الطلب.");
      }

      showToast("تم تحديث تفاصيل الطلب بنجاح.");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل تعديل تفاصيل الطلب.", "error");
    }
  };

  // ======================== إدارة كوبونات الخصم ========================
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderAmount: "0",
      isActive: true,
      expiryDate: "",
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      isActive: coupon.isActive,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
    });
    setIsCouponModalOpen(true);
  };

  const handleCouponFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    if (!couponForm.code || !couponForm.discountValue) {
      showToast("يرجى تعبئة كافة الحقول الإلزامية للكوبون.", "error");
      return;
    }

    try {
      const isEditing = !!editingCoupon;
      const url = "/api/admin/coupons";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? { id: editingCoupon.id, ...couponForm }
        : couponForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء حفظ الكوبون.");
      }

      showToast(
        isEditing ? "تم تعديل الكوبون بنجاح!" : "تم إضافة الكوبون بنجاح!",
      );
      setIsCouponModalOpen(false);
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ ما للكوبون.", "error");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!authToken) return;
    if (!confirm("هل تريد حذف هذا الكوبون ترويجياً بالكامل؟")) return;

    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });

      if (!response.ok) {
        throw new Error("فشل حذف الكوبون.");
      }

      showToast("تم حذف الكوبون بنجاح.");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل حذف الكوبون.", "error");
    }
  };

  // ======================== إدارة تسعير شحن المحافظات ========================
  const handleOpenAddShipping = () => {
    setEditingShipping(null);
    setShippingForm({
      province: "",
      cost: "",
      deliveryDays: "2-3 أيام",
      isActive: true,
    });
    setIsShippingModalOpen(true);
  };

  const handleOpenEditShipping = (setting: ShippingSetting) => {
    setEditingShipping(setting);
    setShippingForm({
      province: setting.province,
      cost: String(setting.cost),
      deliveryDays: setting.deliveryDays || "",
      isActive: setting.isActive,
    });
    setIsShippingModalOpen(true);
  };

  const handleShippingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    if (!shippingForm.province || !shippingForm.cost) {
      showToast("يرجى ملء اسم المحافظة وتكلفة الشحن.", "error");
      return;
    }

    try {
      const isEditing = !!editingShipping;
      const url = "/api/admin/shipping";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? { id: editingShipping.id, ...shippingForm }
        : shippingForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث خطأ أثناء حفظ تكلفة الشحن.");
      }

      showToast(
        isEditing
          ? "تم تعديل تكلفة شحن المحافظة!"
          : "تم إضافة محافظة شحن جديدة!",
      );
      setIsShippingModalOpen(false);
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ ما لتسجيل الشحن.", "error");
    }
  };

  const handleDeleteShipping = async (id: string) => {
    if (!authToken) return;
    if (!confirm("هل تريد حذف إعداد الشحن لهذه المحافظة؟")) return;

    try {
      const response = await fetch(`/api/admin/shipping?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: authToken },
      });

      if (!response.ok) {
        throw new Error("فشل حذف إعداد الشحن.");
      }

      showToast("تم حذف إعداد شحن المحافظة.");
      verifyAndLoad(authToken);
    } catch (err: any) {
      showToast(err.message || "فشل حذف الشحن.", "error");
    }
  };

  // ======================== تحديث المحتوى والضبط العام ========================
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(contentForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل حفظ البانر.");
      }

      showToast("تم تحديث نصوص وصور البانر الرئيسي للمتجر بنجاح!");
      verifyAndLoad(authToken);
    } catch (error: any) {
      showToast(error.message || "فشل تحديث البانر الرئيسي.", "error");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authToken,
        },
        body: JSON.stringify(settingsForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل حفظ إعدادات الضبط.");
      }

      showToast("تم حفظ إعدادات الموقع العامة والـ SEO بنجاح!");
      verifyAndLoad(authToken);
    } catch (error: any) {
      showToast(error.message || "فشل حفظ الإعدادات.", "error");
    }
  };

  // شاشة تسجيل الدخول — Premium Admin Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#0a1228] via-[#0f1a3e] to-[#1a0a28]">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#3238a3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#d4a017]/10 rounded-full blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #d4a017 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="w-full max-w-sm relative z-10 text-right">
          {/* Brand mark */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#1e2d6e] to-[#3238a3] flex items-center justify-center shadow-2xl shadow-[#3238a3]/30 mb-4 border border-white/10">
              <FiLock className="w-7 h-7 text-[#d4a017]" />
            </div>
            <h1 className="text-2xl font-black text-white">بوابة الإدارة</h1>
            <p className="text-xs text-blue-300/60 font-semibold mt-1">
              ألومنيوم إكسبرت — لوحة التحكم الاحترافية
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">
                رمز المرور الإداري
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-sm px-4 py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a017]/60 focus:bg-white/10 transition-all text-center font-mono"
              />
              <p className="text-[10px] text-slate-500 text-center mt-1.5 leading-relaxed">
                الرمز الافتراضي للتطوير:{" "}
                <code className="text-[#d4a017] font-mono">
                  admin_aluminum_2026
                </code>
              </p>
            </div>

            <button
              type="button"
              onClick={handleLoginSubmit as any}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4a017] to-[#f0c84a] text-[#0f1a3e] font-extrabold py-3.5 text-sm shadow-lg shadow-[#d4a017]/20 hover:shadow-[#d4a017]/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <span className="h-4 w-4 border-2 border-[#0f1a3e] border-t-transparent rounded-full animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>دخول إلى لوحة التحكم 🔐</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Dashboard Header */}
      <header className="bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] sticky top-0 z-30 shadow-lg border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-white.svg"
              alt="ألومنيوم إكسبرت"
              className="w-9 h-9 object-contain"
            />
            <div>
              <h1 className="text-sm font-extrabold text-white leading-tight">
                لوحة التحكم الإدارية
              </h1>
              <p className="text-[10px] text-blue-300/60 font-semibold">
                ألومنيوم إكسبرت &bull; Admin Dashboard Pro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => verifyAndLoad(authToken!)}
              disabled={isLoadingData}
              className="p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
              title="تحديث البيانات"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isLoadingData ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-extrabold transition-all cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* الشريط الجانبي الفاخر (Tabs Navigation) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-1 shadow-sm">
            {[
              {
                id: "analytics",
                label: "الرؤى والتحليلات",
                icon: FiTrendingUp,
              },
              { id: "products", label: "إدارة المنتجات", icon: FiPackage },
              { id: "categories", label: "إدارة الأقسام", icon: FiFolder },
              { id: "orders", label: "الطلبات والمبيعات", icon: FiFileText },
              { id: "users", label: "العملاء المسجلون", icon: FiUsers },
              { id: "coupons", label: "كوبونات الخصم", icon: FiTag },
              { id: "shipping", label: "تسعير شحن المحافظات", icon: FiTruck },
              { id: "content", label: "مدير البانر Hero CMS", icon: FiImage },
              { id: "settings", label: "إعدادات المتجر والسيو", icon: FiGlobe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] text-white shadow-md shadow-[#0f1a3e]/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#0f1a3e] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-[#d4a017]" : "text-slate-400"
                    }`}
                  />
                  <span className="flex-grow">{tab.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* حالة النظام */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <FiActivity className="w-3.5 h-3.5 text-emerald-500" />
                <span>حالة خادم البيانات</span>
              </h4>
            </div>
            <div className="p-4 space-y-2 text-[10px] text-slate-500">
              <p className="flex justify-between">
                <span>اتصال النظام:</span>
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  نشط ومتصل
                </span>
              </p>
              <p className="flex justify-between">
                <span>محرك الجداول:</span>{" "}
                <span className="text-slate-400 font-mono">
                  SQLite (Prisma 7)
                </span>
              </p>
              <p className="flex justify-between">
                <span>العملة:</span>{" "}
                <span className="text-[#0f1a3e] font-extrabold">ج.م مصري</span>
              </p>
            </div>
          </div>
        </aside>

        {/* مساحة العمل الرئيسية (Content Area) */}
        <main className="lg:col-span-9 space-y-8 text-right">
          {/* ======================== 1. تبويب التحليلات والرؤى ======================== */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fadeIn">
              {/* شبكة الإحصائيات الفخمة المتقدمة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl transition-all group-hover:scale-125"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        المبيعات الفعلية (Paid)
                      </span>
                      <h3 className="text-2xl font-extrabold text-emerald-600 font-mono">
                        {stats.totalRevenue.toLocaleString("ar-EG")} ج.م
                      </h3>
                      <p className="text-[9px] text-slate-450 mt-1">
                        إجمالي الفواتير المدفوعة إلكترونياً
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                      <FiDollarSign className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/5 rounded-full blur-xl transition-all group-hover:scale-125"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        الطلب الكلي
                      </span>
                      <h3 className="text-2xl font-extrabold text-primary-600 font-mono">
                        {stats.totalOrders} طلب
                      </h3>
                      <p className="text-[9px] text-slate-450 mt-1">
                        كافة الفواتير بجميع الحالات
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                      <FiShoppingCart className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl transition-all group-hover:scale-125"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        العملاء المسجلين
                      </span>
                      <h3 className="text-2xl font-extrabold text-amber-600 font-mono">
                        {stats.totalCustomers} عميل
                      </h3>
                      <p className="text-[9px] text-slate-450 mt-1">
                        إجمالي الحسابات المسجلة
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <FiUsers className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl transition-all group-hover:scale-125"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        نواقص المخزن
                      </span>
                      <h3
                        className={`text-2xl font-extrabold font-mono ${stats.outOfStockCount > 0 ? "text-rose-600 animate-pulse" : "text-slate-500"}`}
                      >
                        {stats.outOfStockCount} منتج
                      </h3>
                      <p className="text-[9px] text-slate-450 mt-1">
                        إكسسوارات وصلت كميتها للصفر
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                      <FiAlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* تحليلات SVG الفخمة الساطعة */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* الرسم البياني للتوزيع */}
                <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-700">
                      تحليل مبيعات وتوزيع المنتجات
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      مبني على قطاعات إكسسوارات الألومنيوم
                    </span>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center relative">
                    <svg
                      className="w-full h-full max-h-56"
                      viewBox="0 0 500 220"
                    >
                      <line
                        x1="40"
                        y1="20"
                        x2="480"
                        y2="20"
                        stroke="#f1f5f9"
                        strokeDasharray="3"
                      />
                      <line
                        x1="40"
                        y1="70"
                        x2="480"
                        y2="70"
                        stroke="#f1f5f9"
                        strokeDasharray="3"
                      />
                      <line
                        x1="40"
                        y1="120"
                        x2="480"
                        y2="120"
                        stroke="#f1f5f9"
                        strokeDasharray="3"
                      />
                      <line
                        x1="40"
                        y1="170"
                        x2="480"
                        y2="170"
                        stroke="#cbd5e1"
                      />

                      <text
                        x="30"
                        y="25"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        100
                      </text>
                      <text
                        x="30"
                        y="75"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        50
                      </text>
                      <text
                        x="30"
                        y="125"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        10
                      </text>
                      <text
                        x="30"
                        y="175"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="end"
                      >
                        0
                      </text>

                      {/* مقابض */}
                      <g className="group cursor-pointer">
                        <rect
                          x="80"
                          y="50"
                          width="30"
                          height="120"
                          rx="4"
                          fill="url(#metalic-gradient-primary)"
                          className="transition-all hover:opacity-90"
                        />
                        <text
                          x="95"
                          y="40"
                          fill="#3b5d81"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          75%
                        </text>
                        <text
                          x="95"
                          y="195"
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          مقابض
                        </text>
                      </g>

                      {/* مفصلات */}
                      <g className="group cursor-pointer">
                        <rect
                          x="180"
                          y="90"
                          width="30"
                          height="80"
                          rx="4"
                          fill="url(#metalic-gradient-gold)"
                          className="transition-all hover:opacity-90"
                        />
                        <text
                          x="195"
                          y="80"
                          fill="#c59b27"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          50%
                        </text>
                        <text
                          x="195"
                          y="195"
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          مفصلات
                        </text>
                      </g>

                      {/* أقفال */}
                      <g className="group cursor-pointer">
                        <rect
                          x="280"
                          y="130"
                          width="30"
                          height="40"
                          rx="4"
                          fill="url(#metalic-gradient-primary)"
                          className="transition-all hover:opacity-90"
                        />
                        <text
                          x="295"
                          y="120"
                          fill="#3b5d81"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          25%
                        </text>
                        <text
                          x="295"
                          y="195"
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          أقفال
                        </text>
                      </g>

                      {/* عجل جرار */}
                      <g className="group cursor-pointer">
                        <rect
                          x="380"
                          y="70"
                          width="30"
                          height="100"
                          rx="4"
                          fill="url(#metalic-gradient-gold)"
                          className="transition-all hover:opacity-90"
                        />
                        <text
                          x="395"
                          y="60"
                          fill="#c59b27"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          60%
                        </text>
                        <text
                          x="395"
                          y="195"
                          fill="#64748b"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          عجل جرار
                        </text>
                      </g>

                      <defs>
                        <linearGradient
                          id="metalic-gradient-primary"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                        <linearGradient
                          id="metalic-gradient-gold"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="md:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-700">
                      توفر المخزون بالمخازن
                    </h4>
                  </div>

                  <div className="flex justify-center items-center py-4">
                    <div className="relative w-36 h-36">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#f1f5f9"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * 0.15}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-extrabold text-slate-850">
                          85%
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">
                          نسبة التوفر
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>{" "}
                        أصناف متوفرة
                      </span>
                      <span className="font-bold text-slate-800">
                        {products.filter((p) => p.stock > 0).length} صنف
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span>{" "}
                        نفذت بالكامل
                      </span>
                      <span className="font-bold text-slate-800">
                        {stats.outOfStockCount} صنف
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================== 2. تبويب إدارة المنتجات ======================== */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                  قائمة إكسسوارات الألومنيوم ({products.length})
                </h3>
                <button
                  onClick={handleOpenAddProduct}
                  className="shadcn-btn-primary px-5 py-2.5 text-sm cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>إضافة منتج جديد</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm shadow-xs">
                  لا توجد منتجات مسجلة بقاعدة البيانات حالياً.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                          <th className="p-4">المنتج والوصف والـ SKU</th>
                          <th className="p-4">القسم</th>
                          <th className="p-4">السعر الفعلي</th>
                          <th className="p-4">المخزون</th>
                          <th className="p-4 text-center">العمليات السريعة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((prod) => {
                          const activePrice =
                            prod.discountPrice !== null &&
                            prod.discountPrice !== undefined
                              ? prod.discountPrice
                              : prod.price;
                          return (
                            <tr
                              key={prod.id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                                  <img
                                    src={prod.images.split(",")[0]}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-slate-800 line-clamp-1">
                                      {prod.name}
                                    </p>
                                    {!prod.isActive && (
                                      <span className="bg-rose-100 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded text-[8px]">
                                        مخفي
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-450 line-clamp-1">
                                    {prod.description}
                                  </p>
                                  <div className="flex gap-2 text-[9px] text-slate-400 font-mono">
                                    {prod.sku && <span>SKU: {prod.sku}</span>}
                                    {prod.brand && (
                                      <span>Brand: {prod.brand}</span>
                                    )}
                                    <span>Slug: {prod.slug}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-medium text-slate-500">
                                {prod.category?.name || "غير مصنف"}
                              </td>
                              <td className="p-4 font-bold text-primary-600 font-mono">
                                {activePrice} ج.م
                                {prod.discountPrice && (
                                  <span className="block text-[10px] text-slate-400 line-through font-normal">
                                    {prod.price} ج.م
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`font-bold px-2 py-0.5 rounded text-[9px]
                                  ${
                                    prod.stock <= 0
                                      ? "bg-rose-50 text-rose-600 border border-rose-100"
                                      : prod.stock <= 5
                                        ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  }`}
                                >
                                  {prod.stock <= 0
                                    ? "نفذت"
                                    : `${prod.stock} قطعة`}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleDuplicateProduct(prod.id)
                                    }
                                    className="p-1.5 rounded-lg border border-slate-200 text-primary-600 hover:bg-slate-50 transition-all cursor-pointer bg-white"
                                    title="نسخ وتكرار المنتج"
                                  >
                                    <FiCopy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-550 hover:text-white hover:bg-slate-100 transition-all cursor-pointer bg-white"
                                    title="تعديل المنتج"
                                  >
                                    <FiEdit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all cursor-pointer bg-white"
                                    title="حذف المنتج"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== 3. تبويب إدارة الأقسام ======================== */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                  إدارة الأقسام والترتيب ({categories.length})
                </h3>
                <button
                  onClick={handleOpenAddCategory}
                  className="shadcn-btn-primary px-5 py-2.5 text-sm cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm shadow-xs">
                  لا توجد أقسام مسجلة حالياً.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                          <th className="p-4">الترتيب</th>
                          <th className="p-4">اسم القسم</th>
                          <th className="p-4">المعرف اللطيف (Slug)</th>
                          <th className="p-4">الوصف</th>
                          <th className="p-4 text-center">التحكم والعمليات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categories.map((cat, idx) => (
                          <tr
                            key={cat.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-mono font-bold text-slate-400">
                              {cat.orderIndex}
                            </td>
                            <td className="p-4 font-bold text-slate-850">
                              {cat.name}
                            </td>
                            <td className="p-4 font-mono text-slate-450">
                              {cat.slug}
                            </td>
                            <td className="p-4 text-slate-500 line-clamp-1 max-w-[200px] mt-2 block border-0">
                              {cat.description || "لا يوجد وصف"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  disabled={idx === 0}
                                  onClick={() =>
                                    handleMoveCategoryOrder(cat, "up")
                                  }
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-sm text-slate-600 rounded disabled:opacity-30"
                                >
                                  ▲
                                </button>
                                <button
                                  disabled={idx === categories.length - 1}
                                  onClick={() =>
                                    handleMoveCategoryOrder(cat, "down")
                                  }
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-sm text-slate-600 rounded disabled:opacity-30"
                                >
                                  ▼
                                </button>
                                <button
                                  onClick={() => handleOpenEditCategory(cat)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer bg-white"
                                >
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1.5 rounded-lg border border-rose-250 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer bg-white"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== 4. تبويب الطلبات والمبيعات بـ Timeline ======================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                إدارة طلبات مبيعات العملاء ({filteredOrders.length} من {orders.length})
              </h3>

              {/* شريط البحث والتصفية */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <div className="relative w-full md:max-w-md">
                  <FiSearch className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={handleSearchChange}
                    placeholder="ابحث بكود الطلب، اسم العميل، رقم الهاتف أو البريد..."
                    className="w-full text-sm pr-9 pl-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-primary-500 text-right"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">تصفية حسب الحالة:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={handleStatusFilterChange}
                    className="w-full md:w-48 text-sm p-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-hidden text-right font-semibold"
                  >
                    <option value="ALL">الكل ({orders.length})</option>
                    <option value="NEW">جديد (NEW)</option>
                    <option value="UNDER_REVIEW">قيد المراجعة (UNDER_REVIEW)</option>
                    <option value="PREPARING">قيد التجهيز (PREPARING)</option>
                    <option value="SHIPPED">تم الشحن (SHIPPED)</option>
                    <option value="DELIVERED">تم التسليم (DELIVERED)</option>
                    <option value="CANCELLED">ملغي (CANCELLED)</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm shadow-xs">
                  {orders.length === 0
                    ? "لا توجد طلبات مسجلة بعد بالمتجر."
                    : "لا توجد نتائج تطابق بحثك."}
                </div>
              ) : (
                <div className="space-y-6">
                  {currentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-sm"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-150 pb-3">
                        <div>
                          <p className="font-bold text-slate-850 flex items-center gap-2 flex-wrap">
                            <span>كود الطلب: {order.id}</span>
                            {order.paymobOrderId && (
                              <span className="text-[9px] bg-slate-50 text-amber-700 border border-slate-200 px-2 py-0.5 rounded">
                                رقم Paymob: {order.paymobOrderId}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-450 mt-1">
                            تاريخ الشراء:{" "}
                            {new Date(order.createdAt).toLocaleString("ar-EG")}
                          </p>
                        </div>

                        {/* الحالات الفنية الثلاثية */}
                        <div className="flex flex-wrap gap-2.5 text-[10px]">
                          {/* 1. حالة الطلب */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">حالة الطلب:</span>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStateUpdate(order.id, {
                                  status: e.target.value,
                                })
                              }
                              className="text-[9px] bg-white text-slate-700 font-bold border border-slate-250 p-1 rounded-lg focus:outline-hidden"
                            >
                              <option value="NEW">جديد (NEW)</option>
                              <option value="UNDER_REVIEW">
                                قيد المراجعة (UNDER_REVIEW)
                              </option>
                              <option value="PREPARING">
                                قيد التجهيز (PREPARING)
                              </option>
                              <option value="SHIPPED">
                                تم الشحن (SHIPPED)
                              </option>
                              <option value="DELIVERED">
                                تم التسليم (DELIVERED)
                              </option>
                              <option value="CANCELLED">
                                ملغي (CANCELLED)
                              </option>
                            </select>
                          </div>

                          {/* 2. حالة الدفع */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">حالة الدفع:</span>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) =>
                                handleOrderStateUpdate(order.id, {
                                  paymentStatus: e.target.value,
                                })
                              }
                              className="text-[9px] bg-white text-slate-700 font-bold border border-slate-250 p-1 rounded-lg focus:outline-hidden"
                            >
                              <option value="PENDING">
                                انتظار الدفع (PENDING)
                              </option>
                              <option value="PAID">
                                تم الدفع بنجاح (PAID)
                              </option>
                              <option value="FAILED">
                                فشلت المعاملة (FAILED)
                              </option>
                              <option value="REFUNDED">
                                مسترجع (REFUNDED)
                              </option>
                            </select>
                          </div>

                          {/* 3. حالة الشحن */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500">الشحن:</span>
                            <select
                              value={order.shippingStatus}
                              onChange={(e) =>
                                handleOrderStateUpdate(order.id, {
                                  shippingStatus: e.target.value,
                                })
                              }
                              className="text-[9px] bg-white text-slate-700 font-bold border border-slate-250 p-1 rounded-lg focus:outline-hidden"
                            >
                              <option value="PREPARING">
                                تجهيز الشحنة (PREPARING)
                              </option>
                              <option value="IN_TRANSIT">
                                جاري النقل (IN_TRANSIT)
                              </option>
                              <option value="DELIVERED">
                                تم التوصيل للباب (DELIVERED)
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 leading-relaxed">
                        <div className="md:col-span-4 space-y-1.5 border-l border-slate-100 pl-4">
                          <p className="font-bold text-slate-700">
                            بيانات التوصيل والشحن بمصر:
                          </p>
                          <p className="text-slate-500">
                            العميل: {order.customerName}
                          </p>
                          <p className="text-slate-500">
                            الهاتف: {order.customerPhone}
                          </p>
                          <p className="text-slate-500 truncate">
                            البريد: {order.customerEmail}
                          </p>
                          <p className="text-slate-500">
                            الوجهة: {order.province || "القاهرة"} &bull;{" "}
                            {order.city}
                          </p>
                          <p className="text-slate-500">
                            العنوان: {order.shippingAddress}
                          </p>
                          {order.notes && (
                            <p className="text-amber-600 font-bold">
                              ملاحظات العميل: {order.notes}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-5 space-y-2">
                          <p className="font-bold text-slate-700">
                            القطع المطلوبة:
                          </p>
                          <div className="space-y-1.5">
                            {order.items.map((item) => (
                              <p
                                key={item.id}
                                className="text-slate-500 flex justify-between gap-4"
                              >
                                <span className="line-clamp-1">
                                  {item.product?.name || "منتج محذوف"} &times;{" "}
                                  {item.quantity}
                                </span>
                                <span className="font-bold text-slate-700 font-mono">
                                  {(item.price * item.quantity).toLocaleString(
                                    "ar-EG",
                                  )}{" "}
                                  ج.م
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col justify-end items-end text-left gap-1">
                          {order.discountAmount > 0 && (
                            <p className="text-emerald-600 font-bold">
                              خصم الكوبون ({order.couponCode}): -
                              {order.discountAmount} ج.م
                            </p>
                          )}
                          <p className="text-slate-450">
                            تكلفة الشحن: {order.shippingFee} ج.م
                          </p>
                          <p className="font-bold text-base text-primary-600 mt-1 font-mono">
                            الإجمالي:{" "}
                            {order.totalAmount.toLocaleString("ar-EG")} ج.م
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

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
                                  : "border border-slate-200 text-slate-650 hover:bg-slate-50 bg-white"
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

          {/* ======================== 5. تبويب العملاء المسجلين ======================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                العملاء المسجلون ({users.length})
              </h3>

              {users.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm shadow-xs">
                  لا يوجد عملاء مسجلون حالياً.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                          <th className="p-4">الاسم بالكامل</th>
                          <th className="p-4">البريد الإلكتروني</th>
                          <th className="p-4">رقم الهاتف</th>
                          <th className="p-4">تاريخ التسجيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-bold text-slate-800">
                              {u.name}
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-left sm:text-right">
                              {u.email}
                            </td>
                            <td
                              className="p-4 text-slate-500 font-mono"
                              dir="ltr"
                            >
                              {u.phone}
                            </td>
                            <td className="p-4 text-slate-450">
                              {new Date(u.createdAt).toLocaleDateString(
                                "ar-EG",
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== 6. تبويب كوبونات الخصم ======================== */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                  إدارة كوبونات الخصم ({coupons.length})
                </h3>
                <button
                  onClick={handleOpenAddCoupon}
                  className="shadcn-btn-primary px-5 py-2.5 text-sm cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>إضافة كوبون جديد</span>
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-sm shadow-xs">
                  لا توجد كوبونات خصم مسجلة حالياً.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                          <th className="p-4">كود الكوبون</th>
                          <th className="p-4">نوع الخصم</th>
                          <th className="p-4">قيمة الخصم</th>
                          <th className="p-4">الحد الأدنى للطلب</th>
                          <th className="p-4">الحالة الصلاحية</th>
                          <th className="p-4 text-center">العمليات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {coupons.map((coupon) => (
                          <tr
                            key={coupon.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-bold text-slate-850 uppercase font-mono">
                              {coupon.code}
                            </td>
                            <td className="p-4 text-slate-500">
                              {coupon.discountType === "PERCENTAGE"
                                ? "نسبة مئوية (%)"
                                : "مبلغ ثابت (ج.م)"}
                            </td>
                            <td className="p-4 font-bold text-primary-600 font-mono">
                              {coupon.discountValue}{" "}
                              {coupon.discountType === "PERCENTAGE"
                                ? "%"
                                : "ج.م"}
                            </td>
                            <td className="p-4 font-mono text-slate-500">
                              {coupon.minOrderAmount} ج.م
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[9px]
                                ${
                                  coupon.isActive
                                    ? "bg-emerald-50 text-emerald-605 border border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                                }`}
                              >
                                {coupon.isActive ? "نشط" : "معطل"}
                              </span>
                              {coupon.expiryDate && (
                                <span className="block text-[8px] text-slate-400 mt-1">
                                  ينتهي:{" "}
                                  {new Date(
                                    coupon.expiryDate,
                                  ).toLocaleDateString("ar-EG")}
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditCoupon(coupon)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer bg-white"
                                >
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer bg-white"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================== 7. تبويب تسعير شحن المحافظات ======================== */}
          {activeTab === "shipping" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                  إعدادات شحن المحافظات ({shippingSettings.length})
                </h3>
                <button
                  onClick={handleOpenAddShipping}
                  className="shadcn-btn-primary px-5 py-2.5 text-sm cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>إضافة محافظة شحن</span>
                </button>
              </div>

              {shippingSettings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-450 text-sm shadow-xs">
                  لا توجد إعدادات شحن مسجلة حالياً.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500">
                          <th className="p-4">المحافظة</th>
                          <th className="p-4">تكلفة التوصيل</th>
                          <th className="p-4">مستغرق أيام الشحن</th>
                          <th className="p-4">حالة الشحن</th>
                          <th className="p-4 text-center">العمليات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {shippingSettings.map((ship) => (
                          <tr
                            key={ship.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-4 font-bold text-slate-800">
                              {ship.province}
                            </td>
                            <td className="p-4 font-bold text-primary-600 font-mono">
                              {ship.cost} ج.م
                            </td>
                            <td className="p-4 text-slate-500 font-mono">
                              {ship.deliveryDays || "غير محدد"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-bold px-2 py-0.5 rounded text-[9px]
                                ${
                                  ship.isActive
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                                }`}
                              >
                                {ship.isActive ? "نشط" : "معطل الشحن"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditShipping(ship)}
                                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer bg-white"
                                >
                                  <FiEdit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteShipping(ship.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer bg-white"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                مدير محتوى البانر الرئيسي (Hero CMS)
              </h3>

              <form
                onSubmit={handleContentSubmit}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 text-sm"
              >
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    العنوان الترحيبي للبانر *
                  </label>
                  <input
                    type="text"
                    required
                    value={contentForm.heroTitle}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        heroTitle: e.target.value,
                      })
                    }
                    className="shadcn-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    الوصف الترحيبي الفرعي *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={contentForm.heroSubtitle}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        heroSubtitle: e.target.value,
                      })
                    }
                    className="shadcn-input"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      رابط صورة البانر *
                    </label>
                    <input
                      type="text"
                      required
                      value={contentForm.heroImage}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          heroImage: e.target.value,
                        })
                      }
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      نص زر CTA
                    </label>
                    <input
                      type="text"
                      value={contentForm.ctaText}
                      onChange={(e) =>
                        setContentForm({
                          ...contentForm,
                          ctaText: e.target.value,
                        })
                      }
                      className="shadcn-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    رابط زر CTA
                  </label>
                  <input
                    type="text"
                    value={contentForm.ctaLink}
                    onChange={(e) =>
                      setContentForm({
                        ...contentForm,
                        ctaLink: e.target.value,
                      })
                    }
                    className="shadcn-input text-left"
                    dir="ltr"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-3 cursor-pointer"
                  >
                    حفظ وإصدار محتوى البانر
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================== 9. تبويب إعدادات المتجر والسيو ======================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-extrabold text-[#0f1a3e]">
                إعدادات المتجر العامة والـ SEO
              </h3>

              <form
                onSubmit={handleSettingsSubmit}
                className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 text-sm"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      اسم المتجر *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteName}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          siteName: e.target.value,
                        })
                      }
                      className="shadcn-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      رابط الشعار (Logo URL)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logo || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          logo: e.target.value,
                        })
                      }
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      هاتف الدعم *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.contactPhone}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          contactPhone: e.target.value,
                        })
                      }
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      بريد الدعم *
                    </label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          contactEmail: e.target.value,
                        })
                      }
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      رقم واتساب *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    رابط فيسبوك
                  </label>
                  <input
                    type="text"
                    value={settingsForm.facebookLink || ""}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        facebookLink: e.target.value,
                      })
                    }
                    className="shadcn-input text-left"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    عنوان السيو الافتراضي *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.metaTitle}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        metaTitle: e.target.value,
                      })
                    }
                    className="shadcn-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    وصف السيو الافتراضي *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={settingsForm.metaDescription}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        metaDescription: e.target.value,
                      })
                    }
                    className="shadcn-input"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-3 cursor-pointer"
                  >
                    حفظ كافة الإعدادات
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ======================== 6. نافذة إضافة/تعديل منتج المنبثقة ======================== */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="product-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              onClick={() => setIsProductModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl text-right shadow-2xl border border-slate-200 text-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] flex-shrink-0">
                <h3
                  className="text-base font-extrabold text-white"
                  id="product-modal-title"
                >
                  {editingProduct
                    ? "✏️ تعديل إكسسوار ألومنيوم"
                    : "➕ إضافة إكسسوار جديد"}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={handleProductFormSubmit}
                className="flex flex-col flex-grow overflow-hidden text-sm"
              >
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      placeholder="مقبض شباك فضي فاخر"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      التصنيف *
                    </label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          categoryId: e.target.value,
                        })
                      }
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-white text-slate-800 focus:outline-hidden text-right"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      السعر الأصلي (ج.م) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.5"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      placeholder="150"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      سعر الخصم الاختياري (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={productForm.discountPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          discountPrice: e.target.value,
                        })
                      }
                      placeholder="120"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      الكمية المتوفرة بالمخزن *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      placeholder="50"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      رمز تتبع المخزون (SKU)
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm({ ...productForm, sku: e.target.value })
                      }
                      placeholder="HDL-SLV-01"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      الماركة / الشركة المصنعة
                    </label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brand: e.target.value,
                        })
                      }
                      placeholder="Alum-Italy"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden text-right"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block mb-2 text-slate-500 font-bold">
                    روابط الصور (مفصولة بفاصلة للصور المتعددة) *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.images}
                    onChange={(e) =>
                      setProductForm({ ...productForm, images: e.target.value })
                    }
                    placeholder="https://image1.jpg,https://image2.jpg"
                    className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      اللون (Color)
                    </label>
                    <input
                      type="text"
                      value={productForm.color}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          color: e.target.value,
                        })
                      }
                      placeholder="أسود مطفي"
                      className="w-full p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      نوع الألومنيوم
                    </label>
                    <input
                      type="text"
                      value={productForm.aluminumType}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          aluminumType: e.target.value,
                        })
                      }
                      placeholder="إيطالي مستورد"
                      className="w-full p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">المقاسات</label>
                    <input
                      type="text"
                      value={productForm.dimensions}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          dimensions: e.target.value,
                        })
                      }
                      placeholder="ارتفاع 20 سم"
                      className="w-full p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      الوزن (كجم)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.weight}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          weight: e.target.value,
                        })
                      }
                      placeholder="0.35"
                      className="w-full p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      عنوان الميتا للسيو (SEO Meta Title)
                    </label>
                    <input
                      type="text"
                      value={productForm.metaTitle}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          metaTitle: e.target.value,
                        })
                      }
                      placeholder="عنوان السيو للمتصفحات"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block mb-2 text-slate-500 font-bold">
                      المعرف اللطيف المخصص (Slug) - اختياري
                    </label>
                    <input
                      type="text"
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm({ ...productForm, slug: e.target.value })
                      }
                      placeholder="اسم-المنتج-سيو"
                      className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block mb-2 text-slate-500 font-bold">
                    وصف الميتا للسيو (SEO Meta Description)
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.metaDescription}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        metaDescription: e.target.value,
                      })
                    }
                    placeholder="اكتب نبذة تظهر في محركات البحث جوجل..."
                    className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="block mb-2 text-slate-500 font-bold">
                    الوصف والتفاصيل الفنية *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="اكتب وصفاً مفصلاً للمنتج ومجالات استخدامه للعملاء..."
                    className="w-full text-sm p-3 border border-slate-250 rounded-xl bg-slate-50 text-slate-800 focus:outline-hidden"
                  ></textarea>
                </div>

                <div className="flex gap-2 items-center p-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={productForm.isActive}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-slate-600 font-bold cursor-pointer"
                  >
                    تفعيل عرض المنتج فورياً بالمعرض الإلكتروني
                  </label>
                </div>

                </div>

                <div className="flex gap-4 border-t border-slate-100 justify-end bg-slate-50 px-6 py-4 flex-shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="shadcn-btn-secondary px-5 py-2.5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-2.5 cursor-pointer"
                  >
                    {editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================== 7. نافذة إضافة/تعديل قسم المنبثقة ======================== */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="category-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              onClick={() => setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl text-right shadow-2xl border border-slate-200 text-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] flex-shrink-0">
                <h3
                  className="text-base font-extrabold text-white"
                  id="category-modal-title"
                >
                  {editingCategory ? "✏️ تعديل قسم" : "➕ إضافة قسم جديد"}
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={handleCategoryFormSubmit}
                className="flex flex-col flex-grow overflow-hidden text-sm"
              >
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      اسم القسم *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="مقابض ألومنيوم"
                      className="shadcn-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          slug: e.target.value,
                        })
                      }
                      placeholder="aluminum-handles"
                      className="shadcn-input text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    وصف القسم
                  </label>
                  <textarea
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="مواصفات ونوع المنتجات التي يضمها هذا القسم..."
                    className="shadcn-input"
                  ></textarea>
                </div>

                </div>

                <div className="flex gap-4 border-t border-slate-100 justify-end bg-slate-50 px-6 py-4 flex-shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="shadcn-btn-secondary px-5 py-2.5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-2.5 cursor-pointer"
                  >
                    {editingCategory ? "حفظ التعديلات" : "إضافة القسم"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================== 8. نافذة إضافة/تعديل كوبون المنبثقة ======================== */}
      {isCouponModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="coupon-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              onClick={() => setIsCouponModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl text-right shadow-2xl border border-slate-200 text-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] flex-shrink-0">
                <h3
                  className="text-base font-extrabold text-white"
                  id="coupon-modal-title"
                >
                  {editingCoupon ? "✏️ تعديل كوبون" : "➕ إضافة كوبون جديد"}
                </h3>
                <button
                  onClick={() => setIsCouponModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={handleCouponFormSubmit}
                className="flex flex-col flex-grow overflow-hidden text-sm"
              >
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      كود الكوبون *
                    </label>
                    <input
                      type="text"
                      required
                      value={couponForm.code}
                      onChange={(e) =>
                        setCouponForm({ ...couponForm, code: e.target.value })
                      }
                      placeholder="مثال: EGY20"
                      className="shadcn-input uppercase font-mono text-left"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      نوع الخصم *
                    </label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountType: e.target.value,
                        })
                      }
                      className="shadcn-input"
                    >
                      <option value="PERCENTAGE">نسبة مئوية (%)</option>
                      <option value="FIXED">مبلغ ثابت (ج.م)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      قيمة الخصم *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountValue: e.target.value,
                        })
                      }
                      placeholder="20"
                      className="shadcn-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      الحد الأدنى (ج.م) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={couponForm.minOrderAmount}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          minOrderAmount: e.target.value,
                        })
                      }
                      placeholder="200"
                      className="shadcn-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    تاريخ الانتهاء (اختياري)
                  </label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        expiryDate: e.target.value,
                      })
                    }
                    className="shadcn-input text-left"
                  />
                </div>

                <div className="flex gap-2 items-center p-1">
                  <input
                    type="checkbox"
                    id="couponActive"
                    checked={couponForm.isActive}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="couponActive"
                    className="text-slate-600 font-bold cursor-pointer"
                  >
                    تفعيل الكوبون للعملاء
                  </label>
                </div>

                </div>

                <div className="flex gap-4 border-t border-slate-100 justify-end bg-slate-50 px-6 py-4 flex-shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    className="shadcn-btn-secondary px-5 py-2.5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-2.5 cursor-pointer"
                  >
                    {editingCoupon ? "حفظ التعديلات" : "إضافة الكوبون"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================== 9. نافذة إضافة/تعديل شحن المنبثقة ======================== */}
      {isShippingModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="shipping-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              onClick={() => setIsShippingModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-2xl bg-white rounded-3xl text-right shadow-2xl border border-slate-200 text-slate-800 z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-[#0f1a3e] to-[#1e2d6e] flex-shrink-0">
                <h3
                  className="text-base font-extrabold text-white"
                  id="shipping-modal-title"
                >
                  {editingShipping ? "✏️ تعديل سعر شحن" : "➕ إضافة محافظة"}
                </h3>
                <button
                  onClick={() => setIsShippingModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={handleShippingFormSubmit}
                className="flex flex-col flex-grow overflow-hidden text-sm"
              >
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      اسم المحافظة *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.province}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          province: e.target.value,
                        })
                      }
                      placeholder="مثال: الغربية"
                      className="shadcn-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                      تكلفة الشحن (ج.م) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={shippingForm.cost}
                      onChange={(e) =>
                        setShippingForm({
                          ...shippingForm,
                          cost: e.target.value,
                        })
                      }
                      placeholder="70"
                      className="shadcn-input"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                    عدد أيام التوصيل
                  </label>
                  <input
                    type="text"
                    value={shippingForm.deliveryDays}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        deliveryDays: e.target.value,
                      })
                    }
                    placeholder="مثال: 3-4 أيام"
                    className="shadcn-input"
                  />
                </div>

                <div className="flex gap-2 items-center p-1">
                  <input
                    type="checkbox"
                    id="shippingActive"
                    checked={shippingForm.isActive}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="shippingActive"
                    className="text-slate-600 font-bold cursor-pointer"
                  >
                    محافظة شحن نشطة ومتاحة
                  </label>
                </div>

                </div>

                <div className="flex gap-4 border-t border-slate-100 justify-end bg-slate-50 px-6 py-4 flex-shrink-0 rounded-b-3xl">
                  <button
                    type="button"
                    onClick={() => setIsShippingModalOpen(false)}
                    className="shadcn-btn-secondary px-5 py-2.5 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="shadcn-btn-primary px-6 py-2.5 cursor-pointer"
                  >
                    {editingShipping ? "حفظ التعديلات" : "إضافة الشحن"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
