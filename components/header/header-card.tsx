"use client";
import { Coins, Gift, LogIn, LogOut, Settings } from "lucide-react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useProfile } from "@/hooks/use-profile";
import { useCredits } from "@/hooks/use-credits";
import { openSettingsDrawer } from "@/lib/ui-state";
import { PurchaseCreditsButton } from "@/components/actions/purchase-credits-button";

export const HeaderCard = () => {
  const t = useTranslations('HeaderCard');
  const { profile } = useProfile();
  const { balance, freeUses } = useCredits();
  const { session } = useSessionContext();

  const isLoggedIn = Boolean(session);
  const displayName = profile?.display_name ?? session?.user.email ?? t('defaultUser');

  return (
    <section className="gradient-card rounded-card p-6 shadow-soft">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
            {isLoggedIn ? <LogIn className="h-6 w-6 text-brand-primary" /> : <LogOut className="h-6 w-6 text-slate-500" />}
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">
              {isLoggedIn ? t('welcomeBack', { displayName }) : t('notLoggedIn')}
            </h2>
            <p className="text-sm text-slate-500">
              {isLoggedIn ? t('loggedInPrompt') : t('loggedOutPrompt')}
            </p>
            {isLoggedIn && (
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-slate-700">{t('credits', { balance })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-rose-500" />
                  <span className="text-slate-600">{t('freeUses', { freeUses })}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn && <PurchaseCreditsButton />}
          <button
            onClick={openSettingsDrawer}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-card transition hover:bg-slate-300"
            aria-label={t('settings')}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
