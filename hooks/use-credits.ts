"use client";
import useSWR from "swr";
import { useSessionContext } from "@supabase/auth-helpers-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { useSupabase } from "@/providers/supabase-provider";

type CreditState = { balance: number; freeuses: number };

const fetchCredits = async (supabase: SupabaseClient<Database>): Promise<CreditState> => {
  const { data, error } = await supabase.rpc<number[]>("get_current_balance");
  if (error) {
    console.warn("Failed to fetch balance", error);
    return { balance: 0, freeuses: 0 };
  }
  if (Array.isArray(data) && data.length === 2) {
    const [balance, freeuses] = data as [number, number];
    return { balance, freeuses };
  }
  return { balance: 0, freeuses: 0 };
};

export const useCredits = () => {
  const supabase = useSupabase();
  const { session } = useSessionContext();
  const { data, mutate } = useSWR(session ? "credits" : null, () => fetchCredits(supabase), { refreshInterval: 60000 });
  return { balance: data?.balance ?? 0, freeUses: data?.freeuses ?? 0, mutate };
};
