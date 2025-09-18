"use client";
import useSWR from "swr";
import type { Database } from "@/types/supabase";
import { useSupabase } from "@/providers/supabase-provider";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useProfile = () => {
  const supabase = useSupabase();

  const fetcher = async () => {
    const { data, error } = await supabase.from("profiles").select("*").single();
    if (error) throw error;
    return data as Profile;
  };

  const { data, error, isLoading, mutate } = useSWR(supabase ? "profile" : null, fetcher);
  return { profile: data, error, isLoading, mutate };
};
