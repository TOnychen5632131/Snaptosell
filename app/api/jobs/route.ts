import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase-server";
import { ensureUserProfile, setCurrentBalance } from "@/lib/supabase-admin";
import { processImageJob } from "@/lib/job-processor";
import type { Database } from "@/types/supabase";

const INSUFFICIENT_CREDITS_MESSAGE = "Insufficient points, please recharge or invite friends to get points";

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { originalStoragePath, previewUrl, mode = "enhance", costCredits: rawCost } = body as {
    originalStoragePath?: string;
    previewUrl?: string;
    mode?: string;
    costCredits?: number;
  };

  if (typeof originalStoragePath !== "string" || !originalStoragePath) {
    return NextResponse.json({ error: "Missing valid image path" }, { status: 400 });
  }

  const costCredits = Number.isFinite(rawCost) ? Math.max(0, Math.floor(Number(rawCost))) : 0;

  let currentBalance = 0;
  let balanceAfterDeduction = 0;

  if (costCredits > 0) {
    const { data: balanceRow, error: balanceError } = await supabase
      .from("current_balance")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (balanceError && balanceError.code !== "PGRST116") {
      console.error("current_balance error", balanceError);
      return NextResponse.json({ error: "Unable to obtain points balance" }, { status: 500 });
    }

    currentBalance = Number(balanceRow?.balance ?? 0) || 0;

    if (currentBalance < costCredits) {
      return NextResponse.json({ error: INSUFFICIENT_CREDITS_MESSAGE }, { status: 402 });
    }

    balanceAfterDeduction = currentBalance - costCredits;
  } else {
    balanceAfterDeduction = currentBalance;
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
    return NextResponse.json({ error: "The account information is abnormal, please try again later" }, { status: 500 });
  }

  const jobId = crypto.randomUUID();
  const sessionKey = `job-${jobId}`;

  if (costCredits > 0) {
    const { error: deductionError } = await (serviceClient as any).rpc("award_credits", {
      p_user: user.id,
      p_delta: -costCredits,
      p_reason: `job:${mode}`,
      p_session: sessionKey
    });

    if (deductionError) {
      console.error("award_credits deduction error", deductionError);
      return NextResponse.json({ error: "Failed to deduct points, please try again later" }, { status: 500 });
    }

    const balanceUpdateError = await setCurrentBalance(serviceClient, user.id, balanceAfterDeduction);
    if (balanceUpdateError) {
      console.error("setCurrentBalance error", balanceUpdateError);
      return NextResponse.json({ error: "Failed to deduct points, please try again later" }, { status: 500 });
    }
  }

  const { data, error } = await (serviceClient.from("image_jobs") as any)
    .insert({
      id: jobId,
      user_id: user.id,
      original_storage_path: originalStoragePath,
      original_preview_url: previewUrl,
      mode,
      state: "pending",
      cost_credits: costCredits
    })
    .select()
    .single();

  if (error || !data) {
    console.error("create image job error", error);
    if (costCredits > 0) {
      await (serviceClient as any).rpc("award_credits", {
        p_user: user.id,
        p_delta: costCredits,
        p_reason: "job:refund",
        p_session: `${sessionKey}-refund-${Date.now()}`
      });
      await setCurrentBalance(serviceClient, user.id, currentBalance);
    }
    return NextResponse.json({ error: "Task creation failed, please try again later" }, { status: 500 });
  }

  try {
    const processedJob = await processImageJob(serviceClient, data);
    return NextResponse.json({ success: true, jobId, mode, costCredits, imageJob: processedJob, balance: balanceAfterDeduction });
  } catch (processingError) {
    console.error("processImageJob error", processingError);

    if (costCredits > 0) {
      await (serviceClient as any).rpc("award_credits", {
        p_user: user.id,
        p_delta: costCredits,
        p_reason: "job:refund",
        p_session: `${sessionKey}-processing-failed-${Date.now()}`
      });
      await setCurrentBalance(serviceClient, user.id, currentBalance);
    }

    await (serviceClient.from("image_jobs") as any)
      .update({ state: "failed", failure_reason: processingError instanceof Error ? processingError.message : "生成失败" })
      .eq("id", jobId);

    const message = processingError instanceof Error ? processingError.message : "生成失败，请稍后再试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
