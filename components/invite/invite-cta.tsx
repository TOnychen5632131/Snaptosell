"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Gift } from "lucide-react";
import { SHARE_APP_LINK, shareAppAndClaimReward } from "@/lib/share-reward";
import { useCredits } from "@/hooks/use-credits";

export const InviteCTA = () => {
  const t = useTranslations('InviteCTA');
  const { mutate: refreshCredits } = useCredits();
  const [redeeming, setRedeeming] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

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

  const handleShareClick = async () => {
    if (sharing) return;

    setSharing(true);
    try {
      const result = await shareAppAndClaimReward();
      if (result.success) {
        refreshCredits();
      }
      setShareMessage(result.maxReached ? t('shareLimit') : t('shareSuccess'));
    } catch (error) {
      setShareMessage(error instanceof Error ? error.message : t('shareFailed'));
    } finally {
      setSharing(false);
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
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <button
            onClick={handleShareClick}
            disabled={sharing}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-card disabled:opacity-70"
          >
            {sharing ? t('sharing') : t('shareButton')}
          </button>
          <p className="text-[11px] text-slate-400">{t('shareHint', { link: SHARE_APP_LINK })}</p>
          {shareMessage && <p className="text-[11px] text-rose-500">{shareMessage}</p>}
        </div>
      </div>
    </section>
  );
};
