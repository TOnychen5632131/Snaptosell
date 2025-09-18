import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const BOOST_AMOUNT = Number(process.env.NEXT_PUBLIC_TEST_BOOST_AMOUNT ?? "1000");

export async function POST() {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const serviceUrl = process.env.SUPABASE_SERVICE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceUrl || !serviceRole) {
    return NextResponse.json({ error: "服务未配置" }, { status: 500 });
  }

  const serviceClient = createClient<Database>(serviceUrl, serviceRole, {
    auth: { persistSession: false }
  });

  const sessionId = `secret-${user.id}-${Date.now()}`;

  const { error: awardError } = await serviceClient.rpc("award_credits", {
    p_user: user.id,
    p_delta: BOOST_AMOUNT,
    p_reason: "secret_tap",
    p_session: sessionId
  });

  if (awardError) {
    console.error("award_credits error", awardError);
    return NextResponse.json({ error: awardError.message }, { status: 500 });
  }

  const { data: balanceData, error: balanceError } = await supabase.rpc("get_current_balance");

  if (balanceError) {
    console.error("get_current_balance error", balanceError);
    return NextResponse.json({ success: true }, { status: 200 });
  }

  return NextResponse.json({ success: true, balance: balanceData }, { status: 200 });
}
