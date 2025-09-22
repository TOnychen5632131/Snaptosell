"use client";
import Image from "next/image";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { ContactPromoBanner } from "@/components/marketing/contact-promo-banner";

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
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 px-6 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(140%_140%_at_90%_-10%,rgba(192,132,252,0.2),transparent_60%),linear-gradient(160deg,rgba(15,23,42,0.95)_0%,rgba(15,23,42,0.62)_48%,rgba(30,41,59,0.85)_100%)]" />
          <div className="absolute inset-0 bg-white/8 mix-blend-soft-light" />
        </div>
        <div className="relative z-20 mx-auto w-full max-w-md pt-4">
          <ContactPromoBanner className="backdrop-blur-xl" />
        </div>
        <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/50 bg-white/10">
              <Image
                src="/logo.svg"
                alt="Snaptosell logo"
                className="h-16 w-16 object-contain"
                width={64}
                height={64}
                priority
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.45em] text-white/70">Welcome to</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white">Snaptosell</h1>
              <p className="text-base text-white/80">Capture products. Create listings. Convert faster.</p>
            </div>
          </div>
          <div className="mt-10">
            <div className="glass-card w-full px-6 py-8 text-left text-slate-800 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.9)]">
              <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
              <p className="mt-2 text-sm text-slate-600">
                Use your email for a magic link or connect instantly with Google to sync credits, history, and cloud processing.
              </p>
              <div className="mt-8">
                <SignInButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
