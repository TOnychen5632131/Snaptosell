"use client";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { SignInButton } from "@/components/auth/sign-in-button";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSessionContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isLoading) setMounted(true);
  }, [isLoading]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-muted px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Login to continue using EasyPic</h1>
        <p className="max-w-sm text-sm text-slate-500">Use email magic link or Google one-click login to unlock credit sync, history, and cloud processing.</p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
};
