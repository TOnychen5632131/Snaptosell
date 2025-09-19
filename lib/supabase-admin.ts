import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export type SupabaseServiceClient = SupabaseClient<Database>;

type EnsureUserParams = {
  id: string;
  email?: string | null;
};

export const ensureUserProfile = async (
  client: SupabaseServiceClient,
  { id, email }: EnsureUserParams
): Promise<PostgrestError | null> => {
  const { error: profileError } = await (client.from("profiles") as any).upsert(
    {
      id,
      email: email ?? null
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return profileError;
  }

  const { error: referralError } = await (client.from("referral_state") as any).upsert(
    { user_id: id },
    { onConflict: "user_id" }
  );

  if (referralError) {
    return referralError;
  }

  const { error: balanceError } = await (client.from("current_balance") as any).insert(
    { user_id: id, balance: 0 },
    { onConflict: "user_id", ignoreDuplicates: true }
  );

  if (balanceError) {
    return balanceError;
  }

  return null;
};

export const setCurrentBalance = async (
  client: SupabaseServiceClient,
  userId: string,
  balance: number
): Promise<PostgrestError | null> => {
  const { error } = await (client.from("current_balance") as any).upsert(
    { user_id: userId, balance },
    { onConflict: "user_id" }
  );
  return error ?? null;
};
