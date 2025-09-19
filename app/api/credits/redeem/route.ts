import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const SECRET_CODE = (process.env.NEXT_PUBLIC_INVITE_GIFT_CODE ?? "520").trim();
const BONUS_AMOUNT = Number(process.env.NEXT_PUBLIC_INVITE_GIFT_BONUS ?? "1000");

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { code?: string } | null;
  const submittedCode = payload?.code?.trim() ?? "";

  if (!submittedCode) {
    return NextResponse.json({ error: "请输入口令" }, { status: 400 });
  }

  if (submittedCode !== SECRET_CODE) {
    return NextResponse.json({ error: "口令不正确" }, { status: 400 });
  }

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

  const serviceClient = createClient<Database>(serviceUrl, serviceRole, { auth: { persistSession: false } });

  const sessionId = `invite-gift-${user.id}`;

  const { error: awardError } = await serviceClient.rpc("award_credits", {
    p_user: user.id,
    p_delta: BONUS_AMOUNT,
    p_reason: "invite_gift_code",
    p_session: sessionId
  });

  if (awardError) {
    const duplicate = awardError.code === "23505" || awardError.message?.includes?.("duplicate");
    const status = duplicate ? 400 : 500;
    const message = duplicate ? "口令已使用" : awardError.message;
    return NextResponse.json({ error: message }, { status });
  }

  const { data: balanceData, error: balanceError } = await supabase.rpc("get_current_balance");

  if (balanceError) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  return NextResponse.json({ success: true, balance: balanceData }, { status: 200 });
}
