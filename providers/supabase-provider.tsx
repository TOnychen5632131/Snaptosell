"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSupabaseClient } from "@supabase/auth-helpers-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());
  return <SessionContextProvider supabaseClient={supabaseClient as unknown as SupabaseClient}>{children}</SessionContextProvider>;
};

export const useSupabase = () => useSupabaseClient<Database>();
export type SupabaseBrowserClient = ReturnType<typeof useSupabase>;
