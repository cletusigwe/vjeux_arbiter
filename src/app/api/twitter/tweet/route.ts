import { NextRequest, NextResponse } from "next/server";
import { get } from "@/lib/db_utils";

const TWEET_URL = "https://api.twitter.com/2/tweets";

export async function POST(request: NextRequest) {
  const { tweet } = await request.json();

  if (!tweet) {
    return NextResponse.json(
      { error: "Tweet text is required" },
      { status: 400 }
    );
  }

  const accessToken = await get("twitter_access_token")

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access token is required" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(TWEET_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweet }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({
      message: "Tweet posted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error posting tweet:", error);
    return NextResponse.json(
      { error: "Failed to post tweet" },
      { status: 500 }
    );
  }
}