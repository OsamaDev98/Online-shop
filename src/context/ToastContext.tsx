"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* حاوية التنبيهات المنبثقة */}
      <div 
        id="toast-container" 
        className="fixed top-5 left-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none"
        dir="rtl"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl border transform transition-all duration-300 animate-slide-in
              ${
                toast.type === "success"
                  ? "bg-emerald-600 border-emerald-700 text-white"
                  : toast.type === "error"
                  ? "bg-rose-600 border-rose-700 text-white"
                  : "bg-blue-600 border-blue-700 text-white"
              }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" && <FiCheckCircle className="w-5 h-5" />}
              {toast.type === "error" && <FiAlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <FiInfo className="w-5 h-5" />}
            </div>
            
            <p className="text-base font-medium flex-grow leading-relaxed">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
