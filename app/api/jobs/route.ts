import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await request.json();
  const { originalStoragePath, previewUrl, mode } = body;
  const { data, error } = await (supabase.from("image_jobs") as any)
    .insert({
      user_id: user.id,
      original_storage_path: originalStoragePath,
      original_preview_url: previewUrl,
      mode: mode ?? "enhance",
      state: "pending",
      cost_credits: 1
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
