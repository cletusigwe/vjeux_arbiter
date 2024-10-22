import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const options = { auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN };
const octokit = new Octokit(options);

export async function POST(req: Request) {
  const { videoId }: { videoId: string } = await req.json();
  try {
    const filePath = path.join(
      process.cwd(),
      "processed_videos",
      `${videoId}.mp4`
    );
    const fileContent = fs.readFileSync(filePath);

    const base64Content = fileContent.toString("base64");

    const owner = process.env.GITHUB_USERNAME!;
    const repo = process.env.GITHUB_DEMO_VIDEOS_REPO!;
    const pathInRepo = `videos/${videoId}.mp4`;

    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: pathInRepo,
      message: `Upload video: ${videoId}`,
      content: base64Content,
    });

    return NextResponse.json({ message: "File uploaded successfully", data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to upload video", details: message },
      { status: 500 }
    );
  }
}
