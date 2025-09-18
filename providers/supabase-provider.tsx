"use client";
import { createContext, useContext, useMemo } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

const SupabaseContext = createContext(createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!));

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useMemo(
    () => createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error("Supabase client unavailable");
  return client;
};
