import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase-server";
import { ensureUserProfile } from "@/lib/supabase-admin";
import type { Database } from "@/types/supabase";

const MAX_FREE_REWARDS = 3;

export async function POST() {
  const supabase = supabaseServer();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const serviceUrl = process.env.SUPABASE_SERVICE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceUrl || !serviceRole) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const serviceClient = createClient<Database>(serviceUrl, serviceRole, { auth: { persistSession: false } });

  const ensureError = await ensureUserProfile(serviceClient, { id: user.id, email: user.email });

  if (ensureError) {
    console.error("ensureUserProfile error", ensureError);
    return NextResponse.json({ error: "Account information error, please try again later" }, { status: 500 });
  }

  const { data: currentState, error: stateError } = await (serviceClient.from("referral_state") as any)
    .select("free_uses_remaining")
    .eq("user_id", user.id)
    .maybeSingle();

  if (stateError && stateError.code !== "PGRST116") {
    console.error("referral_state error", stateError);
    return NextResponse.json({ error: "Unable to retrieve reward status" }, { status: 500 });
  }

  const currentFreeUses = Number(currentState?.free_uses_remaining ?? 0) || 0;

  if (currentFreeUses >= MAX_FREE_REWARDS) {
    return NextResponse.json({ success: false, maxReached: true, freeUses: currentFreeUses }, { status: 200 });
  }

  const newFreeUses = currentFreeUses + 1;

  const { error: updateError } = await (serviceClient.from("referral_state") as any).upsert(
    { user_id: user.id, free_uses_remaining: newFreeUses },
    { onConflict: "user_id" }
  );

  if (updateError) {
    console.error("referral_state upsert error", updateError);
    return NextResponse.json({ error: "Unable to update reward status" }, { status: 500 });
  }

  return NextResponse.json({ success: true, maxReached: newFreeUses >= MAX_FREE_REWARDS, freeUses: newFreeUses }, { status: 200 });
}
