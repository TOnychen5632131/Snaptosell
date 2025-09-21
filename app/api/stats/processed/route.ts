import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export async function GET() {
  const serviceUrl = process.env.SUPABASE_SERVICE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceUrl || !serviceRole) {
    console.error("Supabase service credentials are not configured");
    return NextResponse.json({ totalProcessed: 0 }, { status: 200 });
  }

  const serviceClient = createClient<Database>(serviceUrl, serviceRole, { auth: { persistSession: false } });

  const { data, error } = await (serviceClient
    .from("image_processing_stats")
    .select("processed_total")
    .eq("id", "global")
    .maybeSingle() as any);

  if (error) {
    console.error("Failed to fetch processed stats", error);
    return NextResponse.json({ totalProcessed: 0 }, { status: 200 });
  }

  const totalProcessed = Number.isFinite(data?.processed_total) ? Number(data?.processed_total) : 0;

  return NextResponse.json({ totalProcessed });
}
