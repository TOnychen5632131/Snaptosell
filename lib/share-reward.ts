"use client";

const SHARE_LINK = "https://snaptosell.vercel.app/";
const MAX_FREE_REWARDS = 3;

const copyShareLink = async () => {
  if (typeof navigator === "undefined") {
    throw new Error("Share is only available in the browser");
  }

  const shareData = { title: "Snaptosell", url: SHARE_LINK };

  if (typeof navigator.share === "function") {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      // Fallback to clipboard if user cancels sharing or share API fails
    }
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(SHARE_LINK);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = SHARE_LINK;
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export type ShareRewardResult = {
  success: boolean;
  maxReached: boolean;
  freeUses?: number;
};

export const shareAppAndClaimReward = async (): Promise<ShareRewardResult> => {
  await copyShareLink();

  const response = await fetch("/api/share", { method: "POST" });
  let payload: any = null;

  try {
    payload = await response.json();
  } catch (error) {
    // ignore parse errors when body is empty
  }

  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : "分享失败，请稍后重试";
    throw new Error(message);
  }

  const success = Boolean(payload?.success);
  const maxReached = Boolean(payload?.maxReached);
  const freeUses = typeof payload?.freeUses === "number" ? payload.freeUses : undefined;

  return { success, maxReached, freeUses };
};

export const SHARE_APP_LINK = SHARE_LINK;
export const SHARE_REWARD_LIMIT = MAX_FREE_REWARDS;
