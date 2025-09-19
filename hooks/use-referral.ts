"use client";
import useSWR from "swr";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useSupabase } from "@/providers/supabase-provider";
import type { SupabaseBrowserClient } from "@/providers/supabase-provider";

const fetchReferral = async (supabase: SupabaseBrowserClient, userId: string) => {
  try {
    const [{ data: rawProfile }, { data: rawState }] = await Promise.all([
      supabase.from("profiles").select("invite_code").maybeSingle(),
      supabase
        .from("referral_state")
        .select("pending_inviter_id, free_uses_remaining")
        .eq("user_id", userId)
        .maybeSingle()
    ]);
    const profile = rawProfile as { invite_code: string | null } | null;
    const state = rawState as { pending_inviter_id: string | null; free_uses_remaining: number | null } | null;
    const inviteCode = profile?.invite_code ?? "";
    const inviteUrl = `${window.location.origin}/invite?code=${inviteCode}`;
    return {
      inviteUrl,
      pendingInviter: state?.pending_inviter_id ?? null,
      freeUses: state?.free_uses_remaining ?? 0
    };
  } catch (error) {
    console.warn("Failed to load referral state", error);
    return {
      inviteUrl: `${window.location.origin}/invite?code=`,
      pendingInviter: null,
      freeUses: 0
    };
  }
};

export const useReferral = () => {
  const supabase = useSupabase();
  const { session } = useSessionContext();
  const userId = session?.user?.id;
  const shouldFetch = typeof window !== "undefined" && Boolean(userId);
  const { data, mutate } = useSWR(shouldFetch && userId ? (["referral", userId] as const) : null, ([, id]) => fetchReferral(supabase, id));

  const shareInvite = async () => {
    if (!data?.inviteUrl) return;
    await navigator.clipboard.writeText(data.inviteUrl);
    alert("邀请链接已复制");
  };

  const claimReward = async () => {
    const { error } = await supabase.rpc("claim_invite_reward");
    if (error) {
      alert(error.message);
      return;
    }
    mutate();
  };

  return {
    inviteUrl: data?.inviteUrl ?? "",
    pendingInviter: data?.pendingInviter ?? null,
    shareInvite,
    claimReward
  };
};
