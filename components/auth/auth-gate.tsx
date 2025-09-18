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
        <p className="text-sm text-slate-500">正在加载…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-muted px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">登录以继续使用 EasyPic</h1>
        <p className="max-w-sm text-sm text-slate-500">使用邮箱魔法链接或 Google 一键登录，解锁积分同步、历史记录与云端修图。</p>
        <SignInButton />
      </div>
    );
  }

  return <>{children}</>;
};
