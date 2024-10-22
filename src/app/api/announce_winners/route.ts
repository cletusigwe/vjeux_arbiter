import { ChallengeAnnouncementData } from "@/lib/consts";
import { NextResponse } from "next/server";
function parseTwitterUsername(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname === "x.com" ||
      parsedUrl.hostname === "twitter.com"
    ) {
      const username = parsedUrl.pathname.split("/")[1];
      return username || null;
    }

    return null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}
function isValidThreadsURL(url: string): boolean {
  const regex = /^https:\/\/www\.threads\.net\/@[a-zA-Z0-9_]+$/;
  return regex.test(url);
}

function parseThreadsUsername(url: string): string | null {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "www.threads.net") {
      const username = parsedUrl.pathname.split("/@")[1];
      return username || null;
    }

    return null;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

export async function POST(req: Request) {
  const {
    postIntro,
    firstIntro,
    secondIntro,
    thirdIntro,
    otherIntro,
    nextChallengeIntro,
    twitterAnnounceLink,
    twitterNextAnnounceLink,
    threadsAnnounceLink,
    threadsNextAnnounceLink,
    submissionData,
    postToWebsite,
    repo,
  } = (await req.json()) as ChallengeAnnouncementData;

  const twitterThread: { tweet: string; videoId?: string }[] = [
    { tweet: `${postIntro}\n${twitterAnnounceLink}` },
  ];

  const metaThread: { post: string; quotePost?: string; videoId?: string }[] = [
    { post: `${postIntro}`, quotePost: threadsAnnounceLink },
  ];

  const githubPosts: { message: string; videoId?: string }[] = [];

  for (const submission of submissionData) {
    //save video and thumbnail
    console.log("Saving Video and Thumbnail to your file storage repo")
    const saveVideoToGithubResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/save_demo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: submission.videoId }),
      }
    );
    if (!saveVideoToGithubResult.ok) {
      const errorData = await saveVideoToGithubResult.json();
      console.log(errorData);
      throw new Error(
        `Error while trying to save the demo video and thumbnail with ID: ${submission.videoId} to github: ${errorData.error.message}`
      );
    }

    const twitterUrl = submission.socials.find(
      (s) => s.provider == "twitter"
    )?.url;

    const threadsUrl = submission.socials.find(
      (s) => s.provider == "generic" && isValidThreadsURL(s.url)
    )?.url;

    const twitterHandle = twitterUrl
      ? parseTwitterUsername(twitterUrl)
      : threadsUrl
      ? `${parseThreadsUsername(threadsUrl)}(on threads)`
      : null;

    const threadsHandle = threadsUrl
      ? parseThreadsUsername(threadsUrl)
      : twitterUrl
      ? `${twitterHandle}(on x/twitter)`
      : null;

    const fallbackGitHubHandle = `${submission.githubUserName}(on github)`;

    const tweetBody = `@${twitterHandle ?? fallbackGitHubHandle}. ${
      submission.comment
    }\n${submission.issueLink}`;
    const threadsPostBody = `@${threadsHandle ?? fallbackGitHubHandle}. ${
      submission.comment
    }\n${submission.issueLink}`;

    const githubPostBody = `@${submission.githubUserName}.\n${submission.comment}\n\n[submission](${submission.issueLink})\n\n`;

    if (submission.position == 0) {
      twitterThread.push({
        tweet: `${firstIntro} is @${tweetBody}`,
        videoId: submission.videoId,
      });

      metaThread.push({
        post: `${firstIntro} is ${threadsPostBody}`,
        videoId: submission.videoId,
      });

      githubPosts.push({
        message: `${firstIntro} is ${githubPostBody}`,
        videoId: submission.videoId,
      });
    } else if (submission.position == 1) {
      twitterThread.push({
        tweet: `${secondIntro} is ${tweetBody}`,
        videoId: submission.videoId,
      });

      metaThread.push({
        post: `${secondIntro} is ${threadsPostBody}`,
        videoId: submission.videoId,
      });

      githubPosts.push({
        message: `${secondIntro} is ${githubPostBody}`,
        videoId: submission.videoId,
      });
    } else if (submission.position == 2) {
      twitterThread.push({
        tweet: `${thirdIntro} is ${tweetBody}`,
        videoId: submission.videoId,
      });
      metaThread.push({
        post: `${thirdIntro} is ${threadsPostBody}`,
        videoId: submission.videoId,
      });
      githubPosts.push({
        message: `${thirdIntro} is ${githubPostBody}`,
        videoId: submission.videoId,
      });
    } else {
      twitterThread.push({
        tweet: `${otherIntro} is ${tweetBody}`,
        videoId: submission.videoId,
      });
      metaThread.push({
        post: `${otherIntro} is ${threadsPostBody}`,
        videoId: submission.videoId,
      });

      githubPosts.push({
        message: `${otherIntro} is ${githubPostBody}`,
        videoId: submission.videoId,
      });
    }
  }
  twitterThread.push({
    tweet: `${nextChallengeIntro}\n${twitterNextAnnounceLink}`,
  });
  metaThread.push({
    post: `${nextChallengeIntro}`,
    quotePost: threadsNextAnnounceLink,
  });

  const announcementResult = { url: "" };

  if (postToWebsite == "twitter") {
    const twitterPostResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/tweet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweets: twitterThread }),
      }
    );
    const twitterPostJson = await twitterPostResult.json();
    console.log(twitterPostJson.message);
    announcementResult.url = twitterPostJson.tweetUrl;
  } else if (postToWebsite == "threads") {
    const threadsPostResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ posts: metaThread }),
      }
    );
    const threadsPostJson = await threadsPostResult.json();
    console.log(threadsPostJson.message);
    announcementResult.url = threadsPostJson.postUrl;
  } else if (postToWebsite == "github") {
    const githubPostResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/announce_winners`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ winners: githubPosts, repo: repo }),
      }
    );
    const githubPostJson = await githubPostResult.json();
    console.log(githubPostJson.message);
    announcementResult.url = githubPostJson.postUrl;
  }
  return NextResponse.json(announcementResult);
}
