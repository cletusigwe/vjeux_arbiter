import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const THREADS_APP_ID = process.env.THREADS_APP_ID!;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/callback`;
const AUTH_URL = "https://threads.net/oauth/authorize";

function generateCodeVerifier(length: number) {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, length);
}
export async function GET() {
  const codeVerifier = generateCodeVerifier(128);
  const params = new URLSearchParams({
    client_id: THREADS_APP_ID,
    redirect_uri: REDIRECT_URI,
    scope: "threads_basic,threads_content_publish",
    response_type: "code",
  });

  const authUrl = `${AUTH_URL}?${params.toString()}`;
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
