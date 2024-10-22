import { NextRequest, NextResponse } from "next/server";
import { set } from "@/lib/db_utils";

const THREADS_APP_ID = process.env.THREADS_APP_ID!;
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET!;
const TOKEN_URL = "https://graph.threads.net/oauth/access_token";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code missing" },
      { status: 400 }
    );
  }

  const formData = new URLSearchParams();
  formData.append("client_id", THREADS_APP_ID);
  formData.append("client_secret", THREADS_APP_SECRET);
  formData.append(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/callback`
  );
  formData.append("grant_type", "authorization_code");
  formData.append("code", code);

  try {
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token fetch error: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log(tokenData);
    const accessToken = tokenData.access_token;
    const userId = tokenData.user_id;

    await set("threads_access_token", accessToken);
    await set("threads_user_id", userId);
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
