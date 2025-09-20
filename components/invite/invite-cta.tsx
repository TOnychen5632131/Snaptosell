"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Gift } from "lucide-react";
import { useReferral } from "@/hooks/use-referral";
import { useCredits } from "@/hooks/use-credits";

export const InviteCTA = () => {
  const t = useTranslations('InviteCTA');
  const { inviteUrl, pendingInviter, claimReward, shareInvite } = useReferral();
  const { mutate: refreshCredits } = useCredits();
  const [redeeming, setRedeeming] = useState(false);

  const handleGiftClick = async () => {
    if (redeeming) return;

    const code = window.prompt(t('prompt'), "");
    const sanitized = code?.trim();
    if (!sanitized) {
      if (code !== null) {
        alert(t('promptRequired'));
      }
      return;
    }

    setRedeeming(true);
    try {
      const res = await fetch("/api/credits/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sanitized })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error ?? t('redeemFailed'));
      }
      alert(t('redeemSuccess'));
      refreshCredits();
    } catch (error) {
      alert(error instanceof Error ? error.message : t('redeemFailed'));
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleGiftClick}
            disabled={redeeming}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
            title={t('prompt')}
            aria-label={t('prompt')}
          >
            <Gift className="h-5 w-5" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{t('title')}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t('description')}
            </p>
            {pendingInviter && (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
                {t('pendingInvite')}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <button onClick={shareInvite} className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-card">
            {t('copyLink')}
          </button>
          {pendingInviter && (
            <button onClick={claimReward} className="text-xs text-emerald-600 hover:text-emerald-700">
              {t('claimReward')}
            </button>
          )}
          <p className="text-[11px] text-slate-400">{inviteUrl}</p>
        </div>
      </div>
    </section>
  );
};
