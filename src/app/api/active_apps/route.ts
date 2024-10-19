import { NextResponse } from "next/server";
import { exists } from "@/lib/db_utils";

export async function GET() {
  try {
    const twitterAuth = await exists("twitter_access_token");
    const threadsAuth = await exists("threads_access_token");
    const githubAuth = await exists("github_access_token");

    return NextResponse.json({
      twitterAuth,
      threadsAuth,
      githubAuth,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      { error: "Error checking authentication", details: message },
      { status: 500 }
    );
  }
}
