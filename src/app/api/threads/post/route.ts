import { NextRequest, NextResponse } from "next/server";
import { get } from "@/lib/db_utils";
import fs from "fs";
import path from "path";

const THREADS_API_URL = "https://graph.threads.net/v1.0";

async function createMediaContainer(
  userId: string,
  accessToken: string,
  postText: string,
  mediaType: string,
  quotePostId: string,
  previousPostId?: string,
  videoUrl?: string
) {
  const postUrl = new URL(`${THREADS_API_URL}/${userId}/threads`);
  postUrl.searchParams.append("media_type", mediaType);
  postUrl.searchParams.append("text", postText);
  postUrl.searchParams.append("access_token", accessToken);

  if (mediaType === "VIDEO" && videoUrl) {
    postUrl.searchParams.append("video_url", videoUrl);
  }

  const formData = new URLSearchParams();

  if (quotePostId.trim().length > 0) {
    console.log("QUOTE POST ID", quotePostId);
    formData.append("quote_post_id", quotePostId);
  }

  if (previousPostId) {
    console.log("PREVIOUS POST ID", previousPostId);
    formData.append("reply_to_id", previousPostId);
  }

  const response = await fetch(postUrl.toString(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error posting to Threads: ${errorData.error.message}`);
  }

  return response.json();
}

async function publishPost(
  userId: string,
  accessToken: string,
  mediaContainerID: string
) {
  const publishUrl = new URL(`${THREADS_API_URL}/${userId}/threads_publish`);
  publishUrl.searchParams.append("creation_id", mediaContainerID);
  publishUrl.searchParams.append("access_token", accessToken);

  const response = await fetch(publishUrl.toString(), { method: "POST" });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error publishing post: ${errorData.error.message}`);
  }

  return response.json();
}

async function getPostIds(
  userId: string,
  accessToken: string,
  postUrls: string[]
): Promise<{ [permalink: string]: string }> {
  const allThreadsUrl = new URL(`${THREADS_API_URL}/${userId}/threads`);
  allThreadsUrl.searchParams.append("fields", "id,permalink");
  allThreadsUrl.searchParams.append("access_token", accessToken);

  const response = await fetch(allThreadsUrl.toString());
  if (!response.ok) {
    const errorData = await response.json();
    console.log(errorData);
    throw new Error(`Error getting user's posts: ${errorData.error.message}`);
  }

  const allPosts = await response.json();

  // Filter posts that match postUrls and return a permalink-to-id mapping
  const postInfos = allPosts.data
    .filter((post: { id: string; permalink: string }) =>
      postUrls.includes(post.permalink)
    )
    .reduce(
      (
        acc: { [permalink: string]: string },
        post: { id: string; permalink: string }
      ) => {
        acc[post.permalink] = post.id;
        return acc;
      },
      {}
    );
  return postInfos;
}

// Main API handler for posting to Threads
export async function POST(request: NextRequest) {
  const {
    posts,
  }: { posts: { post: string; quotePost?: string; videoId?: string }[] } =
    await request.json();

  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json(
      { error: "An array of post texts is required" },
      { status: 400 }
    );
  }

  const accessToken = await get("threads_access_token");
  const userIdStr = (await get("threads_user_id"))?.toString();

  if (!accessToken || !userIdStr) {
    return NextResponse.json(
      { error: "Access token or user ID is missing" },
      { status: 400 }
    );
  }

  try {
    const postedThread: { post: any; url: string }[] = [];
    const postIds = await getPostIds(userIdStr, accessToken, [
      posts[0].quotePost!,
      posts[posts.length - 1].quotePost!,
    ]);
    let previousPostId = null;

    for (const post of posts) {
      let mediaContainerID = null;
      let quotePostId = "";
      if (post.quotePost) {
        quotePostId = postIds[post.quotePost];
      }

      if (post.videoId) {
        const videoPath = path.join(
          process.cwd(),
          "processed_videos",
          `${post.videoId}.mp4`
        );

        if (!fs.existsSync(videoPath)) {
          return NextResponse.json(
            { error: `Video file not found: ${videoPath}` },
            { status: 400 }
          );
        }

        const uploadVideoToGithubResult = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/save_demo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoId: post.videoId }),
          }
        );

        if (!uploadVideoToGithubResult.ok) {
          const errorData = await uploadVideoToGithubResult.json();
          console.log(errorData);
          throw new Error(
            `Error while trying to save the demo video with ID: ${post.videoId} to github: ${errorData.error.message}`
          );
        }

        const videoUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_DEMO_VIDEOS_REPO}/refs/heads/main/${post.videoId}.mp4`;

        const uploadData = await createMediaContainer(
          userIdStr,
          accessToken,
          post.post,
          "VIDEO",
          quotePostId,
          previousPostId,
          videoUrl
        );
        mediaContainerID = uploadData.id;
      } else {
        const responseData = await createMediaContainer(
          userIdStr,
          accessToken,
          post.post,
          "TEXT",
          quotePostId,
          previousPostId
        );
        mediaContainerID = responseData.id;
      }

      console.log("Created media id", mediaContainerID);
      // Wait for video processing before publishing
      await new Promise((resolve) => setTimeout(resolve, 60000));
      console.log("Publishing media id", mediaContainerID);

      const publishData = await publishPost(
        userIdStr,
        accessToken,
        mediaContainerID
      );
      // console.log(mediaContainerID, " = ", publishData.id);
      console.log("Published media id", publishData.id);
      previousPostId = publishData.id;
      // break;
      postedThread.push({ post, url: publishData.permalink });
    }

    console.log("DONE");

    return NextResponse.json({
      message: "Meta thread posted successfully",
      postUrl: postedThread[0].url,
    });
  } catch (error) {
    console.error("Error posting to Threads:", error);
    return NextResponse.json(
      { error: "Failed to post on Threads" },
      { status: 500 }
    );
  }
}
