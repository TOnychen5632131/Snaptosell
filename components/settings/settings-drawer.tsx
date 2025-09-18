"use client";
import { Dialog } from "@headlessui/react";
import { settingsStore } from "@/lib/ui-state";
import { useProfile } from "@/hooks/use-profile";
import { useCredits } from "@/hooks/use-credits";
import { LogOut } from "lucide-react";
import { useSupabase } from "@/providers/supabase-provider";

export const SettingsDrawer = () => {
  const { isOpen, close } = settingsStore();
  const { profile } = useProfile();
  const { balance, freeUses } = useCredits();
  const supabase = useSupabase();

  return (
    <Dialog open={isOpen} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex justify-end">
        <Dialog.Panel className="w-full max-w-md bg-white p-8 shadow-soft">
          <header className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">设置</h2>
            <button onClick={close} className="text-sm text-slate-400">
              关闭
            </button>
          </header>
          <div className="space-y-6 text-sm text-slate-600">
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">账户信息</h3>
              <p>登录邮箱：{profile?.email ?? "未知"}</p>
              {profile?.apple_sub && <p>Apple ID: {profile.apple_sub.slice(0, 8)}…</p>}
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">积分与次数</h3>
              <ul className="space-y-2">
                <li>积分余额：{balance}</li>
                <li>剩余免费次数：{freeUses}</li>
              </ul>
            </section>
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">支持</h3>
              <div className="space-y-2">
                <a href="mailto:support@easypicapp.com" className="text-brand-primary hover:text-brand-accent">
                  联系支持
                </a>
                <div className="flex gap-3 text-xs text-slate-400">
                  <a href="https://www.easypicapp.com/privacy" target="_blank" rel="noreferrer">
                    隐私政策
                  </a>
                  <a href="https://www.easypicapp.com/terms" target="_blank" rel="noreferrer">
                    服务条款
                  </a>
                </div>
              </div>
            </section>
          </div>
          <footer className="mt-10 space-y-3">
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
            <p className="text-center text-[11px] text-slate-400">版本号 1.0.0</p>
          </footer>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
