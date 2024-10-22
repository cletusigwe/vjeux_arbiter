import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const options = { auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN };
const octokit = new Octokit(options);

export async function POST(req: Request) {
  const { videoId }: { videoId: string } = await req.json();
  try {
    const videoFilePath = path.join(
      process.cwd(),
      "processed_videos",
      `${videoId}.mp4`
    );
    const thumbnailFilePath = path.join(
      process.cwd(),
      "processed_videos",
      `${videoId}.jpg`
    );
    const videoFileContent = fs.readFileSync(videoFilePath);
    const thumbnailFileContent = fs.readFileSync(thumbnailFilePath);

    const videoBase64Content = videoFileContent.toString("base64");
    const thumbnailBase64Content = thumbnailFileContent.toString("base64");

    const owner = process.env.GITHUB_USERNAME!;
    const repo = process.env.GITHUB_DEMO_VIDEOS_REPO!;
    const videoPathInRepo = `videos/${videoId}.mp4`;
    const thumbnailPathInRepo = `thumbnails/${videoId}.jpg`;

    const videoUploadResult = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: videoPathInRepo,
      message: `Upload video: ${videoId}`,
      content: videoBase64Content,
    });

    const thumbnailUploadResult =
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: thumbnailPathInRepo,
        message: `Upload thumbnail: ${videoId}`,
        content: thumbnailBase64Content,
      });

    return NextResponse.json({
      message: "Files uploaded successfully",
      ...videoUploadResult.data,
      ...thumbnailUploadResult.data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to upload video", details: message },
      { status: 500 }
    );
  }
}
