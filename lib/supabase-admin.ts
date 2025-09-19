import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export type SupabaseServiceClient = SupabaseClient<Database, "public", "public", Database["public"], any>;

type EnsureUserParams = {
  id: string;
  email?: string | null;
};

export const ensureUserProfile = async (
  client: SupabaseServiceClient,
  { id, email }: EnsureUserParams
): Promise<PostgrestError | null> => {
  const { error: profileError } = await client.from("profiles").upsert(
    {
      id,
      email: email ?? null
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return profileError;
  }

  const { error: referralError } = await client.from("referral_state").upsert(
    {
      user_id: id,
      free_uses_remaining: 0
    },
    { onConflict: "user_id" }
  );

  if (referralError) {
    return referralError;
  }

  return null;
};
