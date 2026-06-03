"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: loginPassword }) => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password: loginPassword }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

type loginPassword = string;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // تحميل جلسة المستخدم عند بدء التشغيل
  useEffect(() => {
    const savedUser = localStorage.getItem("aluminum_user_session");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: loginPassword }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل تسجيل الدخول.");
      }

      setUser(result.user);
      localStorage.setItem("aluminum_user_session", JSON.stringify(result.user));
      showToast(`أهلاً بك مجدداً، ${result.user.name}!`, "success");
      return true;

    } catch (error: any) {
      showToast(error.message || "فشل تسجيل الدخول. يرجى التحقق من المدخلات.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: loginPassword }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "فشل إنشاء الحساب.");
      }

      setUser(result.user);
      localStorage.setItem("aluminum_user_session", JSON.stringify(result.user));
      showToast(`تم إنشاء حسابك بنجاح! أهلاً بك يا ${result.user.name}.`, "success");
      return true;

    } catch (error: any) {
      showToast(error.message || "فشل التسجيل. يرجى مراجعة البيانات الحقول.", "error");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("aluminum_user_session");
    showToast("تم تسجيل الخروج بنجاح. نراك قريباً!", "info");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
