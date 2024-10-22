import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

const username = process.env.GITHUB_USERNAME!;

export async function POST(request: Request) {
  try {
    const {
      winners,
      repo,
    }: { winners: { message: string; videoId: string }[]; repo: string } =
      await request.json();

    const readme = await octokit.repos.getContent({
      owner: username,
      repo: repo,
      path: "README.md",
    });

    const readmeContent = Buffer.from(
      (readme.data as any).content,
      "base64"
    ).toString("utf-8");

    const firstSectionEnd = readmeContent.indexOf("\n### Prizes:");

    const winnerAnnouncements = winners
      .map(
        (winner) =>
          `* ${winner.message}\n [![demo_video](https://raw.githubusercontent.com/${username}/${process.env.GITHUB_DEMO_VIDEOS_REPO}/refs/heads/main/thumbnails/${winner.videoId}.jpg)](https://raw.githubusercontent.com/${username}/${process.env.GITHUB_DEMO_VIDEOS_REPO}/refs/heads/main/videos/${winner.videoId}.mp4)`
      )
      .join("\n");
    const updatedReadme =
      readmeContent.slice(0, firstSectionEnd) +
      "\n### Winners:\n" +
      winnerAnnouncements +
      readmeContent.slice(firstSectionEnd);

    await octokit.repos.createOrUpdateFileContents({
      owner: username,
      repo: repo,
      path: "README.md",
      message: "Update README with challenge winners",
      content: Buffer.from(updatedReadme).toString("base64"),
      sha: (readme.data as any).sha,
    });

    return NextResponse.json({
      message: "README updated successfully!",
      url: `https://github.com/${username}/${repo}/`,
    });
  } catch (error: any) {
    console.error("Error updating README:", error);
    return NextResponse.json(
      { message: "Error updating README", error: error.message },
      { status: 500 }
    );
  }
}
