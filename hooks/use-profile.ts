"use client";
import useSWR from "swr";
import { useSessionContext } from "@supabase/auth-helpers-react";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { useSupabase } from "@/providers/supabase-provider";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const useProfile = () => {
  const supabase = useSupabase();
  const { session } = useSessionContext();

  const fetcher = async () => {
    const { data, error } = await supabase.from("profiles").select("*").maybeSingle();
    if (error && (error as PostgrestError).code !== "PGRST116") throw error;
    return (data ?? null) as Profile | null;
  };

  const { data, error, isLoading, mutate } = useSWR(session ? "profile" : null, fetcher);
  return { profile: data ?? null, error, isLoading, mutate };
};
