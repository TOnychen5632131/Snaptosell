"use client";
import { createContext, useContext, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

const SupabaseContext = createContext(createClientComponentClient<Database>());

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const client = useMemo(() => createClientComponentClient<Database>(), []);
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const client = useContext(SupabaseContext);
  if (!client) throw new Error("Supabase client unavailable");
  return client;
};
