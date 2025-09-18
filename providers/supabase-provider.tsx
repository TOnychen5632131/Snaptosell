"use client";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSupabaseClient } from "@supabase/auth-helpers-react";
import type { Database } from "@/types/supabase";

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseClient] = useState(() => createClientComponentClient<Database>());
  return <SessionContextProvider supabaseClient={supabaseClient}>{children}</SessionContextProvider>;
};

export const useSupabase = () => useSupabaseClient<Database>();
