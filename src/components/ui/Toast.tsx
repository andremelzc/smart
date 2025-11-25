"use client";

import React, { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number; // ms
};

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const bg = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className={`fixed bottom-6 right-6 z-[1000] max-w-sm rounded-lg p-4 text-white ${bg} shadow-lg`} role="status">
      <div className="text-sm">{message}</div>
    </div>
  );
}

export default Toast;
