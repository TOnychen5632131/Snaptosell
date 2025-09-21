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
        throw new Error(payload?.error ?? "Unable to create payment order");
      }
      window.location.href = payload.url;
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Payment creation failed, please try again later";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      className="relative flex items-center justify-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-sky-100/85 via-sky-200/70 to-indigo-200/65 px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_28px_62px_-34px_rgba(125,211,252,0.6)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_32px_70px_-32px_rgba(125,211,252,0.65)] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
    >
      {loading ? "Pending" : "Buy Credit"}
    </button>
  );
};
