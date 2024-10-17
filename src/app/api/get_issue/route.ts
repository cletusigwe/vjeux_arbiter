import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import type { IssueData } from "@/lib/consts";

const options = { auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN };
const octokit = new Octokit(options);

function parsePrizes(readme: string): [number, number, number] {
  const prizePattern = /(Winner|(\d+)(?:nd|rd)): \$(\d+)/g;
  const prizes: [number, number, number] = [0, 0, 0];

  let match;
  while ((match = prizePattern.exec(readme)) !== null) {
    const position = match[1] === "Winner" ? 0 : parseInt(match[2], 10) - 1;
    prizes[position] = parseInt(match[3], 10);
  }

  return prizes;
}

export async function POST(req: Request) {
  const { repo } = (await req.json()) as { repo: string };
  try {
    if (!repo) throw new Error("No repo provided");

    const result = await octokit.rest.issues.listForRepo({
      owner: "Algorithm-Arena",
      repo,
    });

    const readmeResponse = await octokit.rest.repos.getReadme({
      owner: "Algorithm-Arena",
      repo,
      mediaType: { format: "raw" },
    });

    const readmeContent: string = readmeResponse.data as unknown as string;
    const deadlineMatch = readmeContent.match(
      /Deadline to submit is (.+?) evening at Midnight PST/
    );
    const deadline = deadlineMatch ? deadlineMatch[1].trim() : null;
    const prizes = parsePrizes(readmeContent);

    const unsortedIssuesData: IssueData[] = await Promise.all(
      result.data.map(async (issue) => {
        const { login, html_url, avatar_url } = issue.user ?? {};
        let socials: { provider: string; url: string }[] = [];

        if (login) {
          const socialsResponse = await octokit.rest.users.listSocialAccountsForUser({
            username: login,
          });
          socials = socialsResponse.data
        }


        return {
          authorUsername: login ?? "<no name>",
          authorProfileUrl: html_url ?? "",
          authorAvatarUrl: avatar_url ?? "",
          issueTitle: issue.title,
          issueCreatedAt: issue.created_at,
          issueContent: issue.body ?? "",
          issueUrl: issue.html_url,
          socials: socials
        };
      })
    );

    const issuesData = unsortedIssuesData.reverse();
    // console.log(issuesData)
    return NextResponse.json({ deadline, issuesData, prizes });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch issues", details: message },
      { status: 500 }
    );
  }
}
