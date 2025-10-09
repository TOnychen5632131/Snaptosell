import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const source =
    typeof body?.source === "string" && body.source.trim().length > 0
      ? body.source.trim().slice(0, 120)
      : "contact-promo-banner";

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }

  const serviceUrl = process.env.SUPABASE_SERVICE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

  if (!serviceUrl || !serviceRole) {
    console.error("Bulk lead submission missing service credentials");
    return NextResponse.json({ error: "Service not configured." }, { status: 500 });
  }

  const supabase = createClient<Database>(serviceUrl, serviceRole, { auth: { persistSession: false } });

  const { error } = await (supabase.from("bulk_leads") as any).upsert(
    { email, source },
    { onConflict: "bulk_leads_email_idx", ignoreDuplicates: true }
  );

  if (error) {
    console.error("Failed to store bulk lead", error);
    return NextResponse.json({ error: "Unable to save your email. Please try again later." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
