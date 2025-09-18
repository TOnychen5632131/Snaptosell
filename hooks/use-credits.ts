"use client";
import useSWR from "swr";
import { supabaseBrowser } from "@/lib/supabase-client";

type CreditState = { balance: number; freeuses: number };

const fetchCredits = async (): Promise<CreditState> => {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase.rpc("get_current_balance");
  if (error) throw error;
  const [balance, freeuses] = data as [number, number];
  return { balance, freeuses };
};

export const useCredits = () => {
  const { data, mutate } = useSWR("credits", fetchCredits, { refreshInterval: 60000 });
  return { balance: data?.balance ?? 0, freeUses: data?.freeuses ?? 0, mutate };
};
