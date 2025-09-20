"use client";
import { useState } from "react";

export const PurchaseCreditsButton = () => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchase/start", { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.url) {
        throw new Error(payload?.error ?? "无法创建支付订单");
      }
      window.location.href = payload.url;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "创建支付失败，请稍后再试";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:from-blue-600 hover:to-blue-700"
      disabled={loading}
    >
      {loading ? "Pending" : "Buy Credit"}
    </button>
  );
};
