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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(120%_120%_at_100%_0%,rgba(165,180,252,0.18),transparent_60%),linear-gradient(165deg,rgba(15,23,42,0.95)_0%,rgba(15,23,42,0.6)_45%,rgba(30,41,59,0.82)_100%)]" />
          <div className="absolute inset-0 bg-white/8 mix-blend-soft-light" />
        </div>
        <div className="glass-card px-8 py-5 text-center text-slate-800">
          <p className="text-sm font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(140%_140%_at_90%_-10%,rgba(192,132,252,0.2),transparent_60%),linear-gradient(160deg,rgba(15,23,42,0.95)_0%,rgba(15,23,42,0.62)_48%,rgba(30,41,59,0.85)_100%)]" />
          <div className="absolute inset-0 bg-white/8 mix-blend-soft-light" />
        </div>
        <div className="glass-card w-full max-w-xl px-10 py-12 text-center text-slate-800">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Login to continue using EasyPic</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
            Use email magic link or Google one-click login to unlock credit sync, history, and cloud processing.
          </p>
          <div className="mt-8 flex justify-center">
            <SignInButton />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
