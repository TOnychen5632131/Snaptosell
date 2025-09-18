"use client";
import { Gift } from "lucide-react";
import { useReferral } from "@/hooks/use-referral";

export const InviteCTA = () => {
  const { inviteUrl, pendingInviter, claimReward, shareInvite } = useReferral();

  return (
    <section className="rounded-card bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">邀请好友各得 1 次免费修图</h3>
            <p className="mt-1 text-sm text-slate-500">
              分享你的专属链接，朋友首次登录即可各获 1 次免费次数，最多累积 3 次。
            </p>
            {pendingInviter && (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
                发现好友邀请！点击领取可获得额外免费次数。
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <button onClick={shareInvite} className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-card">
            复制邀请链接
          </button>
          {pendingInviter && (
            <button onClick={claimReward} className="text-xs text-emerald-600 hover:text-emerald-700">
              领取好友奖励
            </button>
          )}
          <p className="text-[11px] text-slate-400">{inviteUrl}</p>
        </div>
      </div>
    </section>
  );
};
