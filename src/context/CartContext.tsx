"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  images: string; // الرابط الأول
  quantity: number;
  stock: number;
  color?: string | null;
  dimensions?: string | null;
}

export interface Coupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  
  // ميزات الفئة الاحترافية (Pro-Tier)
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  shippingProvince: string;
  shippingFee: number;
  updateShippingProvince: (province: string, fee: number) => void;
  discountAmount: number;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingProvince, setShippingProvince] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<number>(0);
  const { showToast } = useToast();

  // تحميل السلة من الـ LocalStorage عند بدء التشغيل
  useEffect(() => {
    const savedCart = localStorage.getItem("aluminum_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }

    const savedCoupon = localStorage.getItem("aluminum_coupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {}
    }

    const savedProvince = localStorage.getItem("aluminum_province");
    const savedShippingFee = localStorage.getItem("aluminum_shipping_fee");
    if (savedProvince && savedShippingFee) {
      setShippingProvince(savedProvince);
      setShippingFee(Number(savedShippingFee));
    }
  }, []);

  // حفظ السلة في الـ LocalStorage عند تعديلها
  useEffect(() => {
    localStorage.setItem("aluminum_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    const existingItem = cartItems.find((item) => item.id === newItem.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > newItem.stock) {
        showToast(`عذراً، الكمية المطلوبة غير متوفرة بالكامل في المخزن. المتوفر: ${newItem.stock}`, "error");
        return;
      }
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === newItem.id ? { ...item, quantity: newQuantity } : item
        )
      );
      showToast("تم تحديث كمية المنتج في السلة بنجاح!");
      return;
    }
    
    if (quantity > newItem.stock) {
      showToast(`عذراً، الكمية المطلوبة غير متوفرة بالكامل في المخزن. المتوفر: ${newItem.stock}`, "error");
      return;
    }

    setCartItems((prevItems) => [...prevItems, { ...newItem, quantity }]);
    showToast("تم إضافة المنتج إلى السلة بنجاح!");
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    showToast("تم إزالة المنتج من السلة.", "info");
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    if (quantity > item.stock) {
      showToast(`عذراً، الكمية المتاحة في المخزن هي ${item.stock} فقط.`, "error");
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setShippingProvince("");
    setShippingFee(0);
    localStorage.removeItem("aluminum_cart");
    localStorage.removeItem("aluminum_coupon");
    localStorage.removeItem("aluminum_province");
    localStorage.removeItem("aluminum_shipping_fee");
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // حساب قيمة الخصم بناءً على الكوبون وإجمالي المشتريات
  let discountAmount = 0;
  if (appliedCoupon && cartTotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  // التأكد من إزالة الكوبون تلقائياً إذا انخفض الإجمالي عن الحد الأدنى
  useEffect(() => {
    if (appliedCoupon && cartTotal < appliedCoupon.minOrderAmount) {
      setAppliedCoupon(null);
      localStorage.removeItem("aluminum_coupon");
      showToast(`تم إلغاء الكوبون تلقائياً لأن إجمالي الطلب أقل من الحد الأدنى للخصم (${appliedCoupon.minOrderAmount} ج.م)`, "info");
    }
  }, [cartTotal, appliedCoupon, showToast]);

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (cartTotal === 0) {
      showToast("السلة فارغة، أضف منتجات أولاً لتطبيق الخصم.", "error");
      return false;
    }

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: cartTotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "كود الخصم غير صالح.", "error");
        return false;
      }

      const couponData: Coupon = {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
      };

      setAppliedCoupon(couponData);
      localStorage.setItem("aluminum_coupon", JSON.stringify(couponData));
      showToast(`تم تطبيق كود الخصم "${code}" بنجاح!`, "success");
      return true;
    } catch (error) {
      console.error("Coupon validation error:", error);
      showToast("حدث خطأ أثناء الاتصال بالخادم للتحقق من الكوبون.", "error");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("aluminum_coupon");
    showToast("تم إزالة كود الخصم.", "info");
  };

  const updateShippingProvince = (province: string, fee: number) => {
    setShippingProvince(province);
    setShippingFee(fee);
    localStorage.setItem("aluminum_province", province);
    localStorage.setItem("aluminum_shipping_fee", String(fee));
  };

  const finalTotal = Math.max(0, cartTotal + shippingFee - discountAmount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingProvince,
        shippingFee,
        updateShippingProvince,
        discountAmount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
