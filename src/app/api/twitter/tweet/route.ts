import path from "path";
import { NextRequest, NextResponse } from "next/server";
// import { uploadVideo } from "@/lib/upload_video";
import {
  uploadImage,
  uploadVideo,
} from "@/lib/upload_media_with_python_script";
import { get } from "@/lib/db_utils";

const TWEET_URL = "https://api.twitter.com/2/tweets";

export async function POST(request: NextRequest) {
  const {
    tweets,
  }: { tweets: { tweet: string; videoId?: string; imageFilePath?: string }[] } =
    await request.json();

  if (!tweets || !Array.isArray(tweets) || tweets.length === 0) {
    return NextResponse.json(
      { error: "An array of tweet texts is required" },
      { status: 400 }
    );
  }
  const accessToken = await get("twitter_access_token");

  try {
    const username = process.env.TWITTER_USERNAME;
    let previousTweetId = null;
    const postedTweets = [];

    for (const tweet of tweets) {
      let mediaId = null;

      // If tweet contains a videoId, upload the video
      if (tweet.videoId) {
        const videoPath = path.join(
          process.cwd(),
          `processed_videos/${tweet.videoId}.mp4`
        );
        try {
          mediaId = await uploadVideo(videoPath);
        } catch (error) {
          throw new Error(`Error while trying to upload video: ${videoPath}`);
        }
      }

      if (tweet.imageFilePath) {
        try {
          mediaId = await uploadImage(tweet.imageFilePath);
        } catch (error) {
          throw new Error(
            `Error while trying to upload image: ${tweet.imageFilePath}`
          );
        }
      }

      const body: {
        text: string;
        media?: { media_ids: string[] };
        reply?: { in_reply_to_tweet_id: number };
      } = previousTweetId
        ? {
            text: tweet.tweet,
            reply: { in_reply_to_tweet_id: previousTweetId },
          }
        : { text: tweet.tweet };

      if (mediaId) {
        body.media = { media_ids: [mediaId] };
      }
      const response = await fetch(TWEET_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      console.log(result);
      postedTweets.push({
        tweet: result,
        url: `https://x.com/${username}/status/${result.data.id}`,
      });

      previousTweetId = result.data.id;
    }

    return NextResponse.json({
      message: "Twitter thread posted successfully",
      tweetUrl: postedTweets[0].url,
    });
  } catch (error) {
    console.error("Error posting tweet thread:", error);
    return NextResponse.json(
      { error: "Failed to post tweet thread" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { get } from "@/lib/db_utils";

// const TWEET_URL = "https://api.twitter.com/2/tweets";
// const REPLY_TO_TWEET_ID = "1853194718902878372";
// const TWEET_TEXT =
//   "https://open.spotify.com/track/7pKo3vzmrlG2KcRVqzdoA5";

// export async function GET() {
//   const accessToken = await get("twitter_access_token");

//   try {
//     const body: {
//       text: string;
//       reply: { in_reply_to_tweet_id: string };
//     } = {
//       text: TWEET_TEXT,
//       reply: { in_reply_to_tweet_id: REPLY_TO_TWEET_ID },
//     };

//     const response = await fetch(TWEET_URL, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     if (!response.ok) {
//       throw new Error(await response.text());
//     }

//     const result = await response.json();
//     console.log(result);
//     const username = process.env.TWITTER_USERNAME;

//     return NextResponse.json({
//       message: "Reply posted successfully",
//       tweetUrl: `https://x.com/${username}/status/${result.data.id}`,
//     });
//   } catch (error) {
//     console.error("Error posting tweet:", error);
//     return NextResponse.json(
//       { error: "Failed to post tweet" },
//       { status: 500 }
//     );
//   }
// }
