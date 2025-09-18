"use client";
import { useState } from "react";

export const PurchaseCreditsButton = () => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/purchase/start", { method: "POST" });
      if (!res.ok) throw new Error("无法创建支付订单");
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      alert("创建支付失败，请稍后再试");
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
      {loading ? "处理中…" : "购买积分"}
    </button>
  );
};
