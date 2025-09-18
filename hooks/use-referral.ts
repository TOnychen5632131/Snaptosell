"use client";
import useSWR from "swr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { useSupabase } from "@/providers/supabase-provider";

const fetchReferral = async (supabase: SupabaseClient<Database>) => {
  const [{ data: profile }, { data: state }] = await Promise.all([
    supabase.from("profiles").select("invite_code").single(),
    supabase.from("referral_state").select("pending_inviter_id, free_uses_remaining").single()
  ]);
  const inviteCode = profile?.invite_code ?? "";
  const inviteUrl = `${window.location.origin}/invite?code=${inviteCode}`;
  return {
    inviteUrl,
    pendingInviter: state?.pending_inviter_id ?? null,
    freeUses: state?.free_uses_remaining ?? 0
  };
};

export const useReferral = () => {
  const supabase = useSupabase();
  const { data, mutate } = useSWR(typeof window === "undefined" ? null : "referral", () => fetchReferral(supabase));

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
