import { NextRequest, NextResponse } from "next/server";
import { set } from "@/lib/db_utils";
import { access } from "fs";

const THREADS_APP_ID = process.env.THREADS_APP_ID!;
const THREADS_APP_SECRET = process.env.THREADS_APP_SECRET!;
const SHORT_TOKEN_URL = "https://graph.threads.net/oauth/access_token";
const LONG_TOKEN_URL = "https://graph.threads.net/access_token";

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
    const shortLivedTokenResponse = await fetch(SHORT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!shortLivedTokenResponse.ok) {
      throw new Error(
        `Short Lived Token fetch error: ${shortLivedTokenResponse.statusText}`
      );
    }

    const shortLivedTokenData = await shortLivedTokenResponse.json();
    // console.log(tokenData);
    const shortLivedAccessToken = shortLivedTokenData.access_token;
    const userId = shortLivedTokenData.user_id;

    const longLivedTokenRequestData = new URLSearchParams({
      grant_type: "th_exchange_token",
      client_secret: THREADS_APP_SECRET,
      access_token: shortLivedAccessToken,
    });
    const longLivedTokenResponse = await fetch(
      `${LONG_TOKEN_URL}?${longLivedTokenRequestData.toString()}`
    );

    if (!longLivedTokenResponse.ok) {
      throw new Error(
        `Long Lived Token fetch error: ${shortLivedTokenResponse.statusText}`
      );
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    const longLivedAccessToken = longLivedTokenData.access_token;

    await set("threads_access_token", longLivedAccessToken);
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
