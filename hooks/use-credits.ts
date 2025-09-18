"use client";
import useSWR from "swr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { useSupabase } from "@/providers/supabase-provider";

type CreditState = { balance: number; freeuses: number };

const fetchCredits = async (supabase: SupabaseClient<Database>): Promise<CreditState> => {
  const { data, error } = await supabase.rpc("get_current_balance");
  if (error) throw error;
  const [balance, freeuses] = data as [number, number];
  return { balance, freeuses };
};

export const useCredits = () => {
  const supabase = useSupabase();
  const { data, mutate } = useSWR("credits", () => fetchCredits(supabase), { refreshInterval: 60000 });
  return { balance: data?.balance ?? 0, freeUses: data?.freeuses ?? 0, mutate };
};
