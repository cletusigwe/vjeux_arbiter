import { NextResponse } from "next/server";
import crypto from "crypto";

const CLIENT_ID = process.env.TWITTER_OAUTH2_CLIENT_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/callback`;
const AUTH_URL = "https://twitter.com/i/oauth2/authorize";

function generateCodeVerifier(length: number) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, length);
}

function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export async function GET() {
  const codeVerifier = generateCodeVerifier(128);
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "tweet.read tweet.write offline.access",
    state: crypto.randomBytes(16).toString("hex"),
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authUrl = `${AUTH_URL}?${params.toString()}`;

  // Store code_verifier in a secure HTTP-only cookie
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
