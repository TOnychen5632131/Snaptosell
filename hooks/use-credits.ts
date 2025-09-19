"use client";
import useSWR from "swr";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useSupabase } from "@/providers/supabase-provider";
import type { SupabaseBrowserClient } from "@/providers/supabase-provider";

type CreditState = { balance: number; freeuses: number };

const fetchCredits = async (supabase: SupabaseBrowserClient): Promise<CreditState> => {
  const response = await supabase.rpc("get_current_balance");
  const { error } = response;
  const values = (response.data as unknown as number[] | null) ?? null;
  if (error) {
    console.warn("Failed to fetch balance", error);
    return { balance: 0, freeuses: 0 };
  }
  if (Array.isArray(values) && values.length === 2) {
    const [balance, freeuses] = values as [number, number];
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
