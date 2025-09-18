import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      scopes: "name email",
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  });
  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "无法跳转到 Apple 登录" }, { status: 500 });
  }
  return NextResponse.redirect(data.url);
}
