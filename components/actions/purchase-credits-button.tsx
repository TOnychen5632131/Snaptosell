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
      className="relative flex items-center justify-center gap-2 rounded-full border border-white/60 bg-gradient-to-r from-sky-500/85 to-indigo-500/70 px-5 py-3 text-sm font-semibold text-white shadow-[0_26px_55px_-32px_rgba(37,99,235,0.9)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_32px_62px_-30px_rgba(37,99,235,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
    >
      {loading ? "Pending" : "Buy Credit"}
    </button>
  );
};
