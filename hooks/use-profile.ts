"use client";
import useSWR from "swr";
import { supabaseBrowser } from "@/lib/supabase-client";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useProfile = () => {
  const fetcher = async () => {
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.from("profiles").select("*").single();
    if (error) throw error;
    return data as Profile;
  };

  const { data, error, isLoading, mutate } = useSWR("profile", fetcher);
  return { profile: data, error, isLoading, mutate };
};
