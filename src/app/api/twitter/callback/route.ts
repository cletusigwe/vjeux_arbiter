import { NextRequest, NextResponse } from "next/server";
import { set } from "@/lib/db_utils";

const CLIENT_ID = process.env.TWITTER_OAUTH2_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITTER_OAUTH2_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`;
const TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const codeVerifier = request.cookies.get("code_verifier")?.value;

  if (!code || !state || !codeVerifier) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tokenData = new URLSearchParams({
    code: code,
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  try {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    await set("twitter_access_token", data.access_token);
    await set("twitter_refresh_token", data.refresh_token);
    return NextResponse.redirect(new URL("/", request.nextUrl));
  } catch (error) {
    console.error("Error getting access token:", error);
    return NextResponse.json(
      { error: "Failed to get access token" },
      { status: 500 }
    );
  }
}
