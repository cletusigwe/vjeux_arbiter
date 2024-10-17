import { NextRequest, NextResponse } from "next/server";
import { get } from "@/lib/db_utils";

const THREADS_API_URL = "https://graph.threads.net";

export async function GET(req: NextRequest) {
  //TODO make a POST route
  const accessToken = await get("threads_access_token");
  const userId = await get("threads_user_id");
  const postMessage = "hello world, [sent with curl]";

  if (!accessToken || !userId) {
    return NextResponse.json(
      { error: "Access token or user ID is missing" },
      { status: 400 }
    );
  }

  try {
    const postUrl = new URL(`${THREADS_API_URL}/${userId}/threads`);
    postUrl.searchParams.append("media_type", "TEXT");
    postUrl.searchParams.append("text", postMessage);
    postUrl.searchParams.append("access_token", accessToken);

    const response = await fetch(postUrl.toString(), {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error posting to Threads: ${errorData.error.message}`);
    }

    const responseData = await response.json();
    const mediaContainerID = responseData.id;

    // Wait for 45 seconds to allow Facebook servers to process the media
    await new Promise((resolve) => setTimeout(resolve, 45000));

    const publishUrl = new URL(`${THREADS_API_URL}/${userId}/threads_publish`);
    publishUrl.searchParams.append("creation_id", mediaContainerID);
    publishUrl.searchParams.append("access_token", accessToken);

    // Second POST request to publish the thread
    const response2 = await fetch(publishUrl.toString(), {
      method: "POST",
    });

    // Check if the second request was successful
    if (!response2.ok) {
      const errorData = await response2.json();
      throw new Error(`Error publishing thread: ${errorData.error.message}`);
    }

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error posting to Threads:", error);
    return NextResponse.json(
      { error: "Failed to post on Threads" },
      { status: 500 }
    );
  }
}
