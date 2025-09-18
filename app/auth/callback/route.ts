import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=auth`);
  }
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}
