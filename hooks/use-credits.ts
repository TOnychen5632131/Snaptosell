"use client";
import useSWR from "swr";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useSupabase } from "@/providers/supabase-provider";
import type { SupabaseBrowserClient } from "@/providers/supabase-provider";

type CreditState = { balance: number; freeuses: number };

const fetchCredits = async (supabase: SupabaseBrowserClient, userId: string): Promise<CreditState> => {
  const [{ data: balanceRow, error: balanceError }, { data: referralRow, error: referralError }] = await Promise.all([
    supabase.from("current_balance").select("balance").eq("user_id", userId).maybeSingle(),
    supabase.from("referral_state").select("free_uses_remaining").eq("user_id", userId).maybeSingle()
  ]);

  if (balanceError) {
    console.warn("Failed to fetch balance", balanceError);
  }
  if (referralError) {
    console.warn("Failed to fetch free uses", referralError);
  }

  const balance = Number(balanceRow?.balance ?? 0) || 0;
  const freeuses = Number(referralRow?.free_uses_remaining ?? 0) || 0;

  return { balance, freeuses };
};

export const useCredits = () => {
  const supabase = useSupabase();
  const { session } = useSessionContext();
  const userId = session?.user?.id;
  const { data, mutate } = useSWR(
    userId ? ( ["credits", userId] as const ) : null,
    ([, id]) => fetchCredits(supabase, id),
    { refreshInterval: 60000 }
  );
  return { balance: data?.balance ?? 0, freeUses: data?.freeuses ?? 0, mutate };
};
