"use client";
import { Coins, Gift, LogIn, LogOut, Settings } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";
import { useCredits } from "@/hooks/use-credits";
import { openSettingsDrawer } from "@/lib/ui-state";
import { PurchaseCreditsButton } from "@/components/actions/purchase-credits-button";

export const HeaderCard = () => {
  const { profile } = useProfile();
  const { balance, freeUses } = useCredits();

  return (
    <section className="gradient-card rounded-card p-6 shadow-soft">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
            {profile ? <LogIn className="h-6 w-6 text-brand-primary" /> : <LogOut className="h-6 w-6 text-slate-500" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">
              {profile ? `欢迎回来，${profile.display_name ?? "EasyPic 用户"}` : "尚未登录"}
            </h2>
            <p className="text-sm text-slate-500">
              {profile ? "积分与免费次数会在所有设备之间同步。" : "登录后可解锁云端修图、积分同步与邀请奖励。"}
            </p>
            {profile && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-slate-700">积分 {balance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-rose-500" />
                  <span className="text-slate-600">免费次数 {freeUses}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && <PurchaseCreditsButton />}
          <button
            onClick={openSettingsDrawer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-card transition hover:bg-slate-300"
            aria-label="设置"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
