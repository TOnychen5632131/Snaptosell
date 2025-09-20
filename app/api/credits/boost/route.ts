import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { ensureUserProfile, setCurrentBalance } from "@/lib/supabase-admin";

const BOOST_AMOUNT = Number(process.env.NEXT_PUBLIC_TEST_BOOST_AMOUNT ?? "1000");

export async function POST() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const serviceUrl = process.env.SUPABASE_SERVICE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceUrl || !serviceRole) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const serviceClient = createClient<Database>(serviceUrl, serviceRole, {
    auth: { persistSession: false }
  });

  const ensureError = await ensureUserProfile(serviceClient, { id: user.id, email: user.email });

  if (ensureError) {
    console.error("ensureUserProfile error", ensureError);
    return NextResponse.json({ error: "Account information error, please try again later" }, { status: 500 });
  }

  const sessionId = `secret-${user.id}-${Date.now()}`;
  const adminClient = serviceClient as any;

  const { data: currentRow, error: currentError } = await (serviceClient.from("current_balance") as any)
    .select("balance")
    .eq("user_id", user.id)
    .maybeSingle();

  if (currentError && currentError.code !== "PGRST116") {
    console.error("current_balance error", currentError);
    return NextResponse.json({ error: "Unable to get credit balance" }, { status: 500 });
  }

  const currentBalance = Number(currentRow?.balance ?? 0) || 0;

  const { error: awardError } = await adminClient.rpc("award_credits", {
    p_user: user.id,
    p_delta: BOOST_AMOUNT,
    p_reason: "secret_tap",
    p_session: sessionId
  });

  if (awardError) {
    console.error("award_credits error", awardError);
    return NextResponse.json({ error: awardError.message }, { status: 500 });
  }

  const newBalance = currentBalance + BOOST_AMOUNT;
  const balanceUpdateError = await setCurrentBalance(serviceClient, user.id, newBalance);

  if (balanceUpdateError) {
    console.error("setCurrentBalance error", balanceUpdateError);
  }

  return NextResponse.json({ success: true, balance: newBalance }, { status: 200 });
}
