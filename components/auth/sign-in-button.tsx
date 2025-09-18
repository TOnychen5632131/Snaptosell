"use client";
import { useState } from "react";

export const SignInButton = () => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      window.location.href = "/api/auth/apple";
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-card transition hover:bg-slate-800"
      disabled={loading}
    >
      {loading ? "跳转中…" : "使用 Apple 登录"}
    </button>
  );
};
