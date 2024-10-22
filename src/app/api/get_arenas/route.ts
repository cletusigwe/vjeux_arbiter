import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import type { Arena } from "@/lib/consts";

const options = { auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN };
const octokit = new Octokit(options);

function parsePrizes(readme: string): [number, number, number] {
  const prizePattern = /(?:Winner|(\d+)(?:nd|rd)): \$(\d+)/g;
  const prizes: [number, number, number] = [0, 0, 0];
  let match;

  while ((match = prizePattern.exec(readme)) !== null) {
    const position = match[1] === undefined ? 0 : parseInt(match[1], 10) - 1;
    prizes[position] = parseInt(match[2], 10);
  }

  return prizes;
}

function detectWinnersSection(readme: string): boolean {
  const winnersSection = /#+\s*(?:Winners|Winner):?\s*([\s\S]*?)\n#+/gi;
  const match = winnersSection.exec(readme);

  if (match) {
    const sectionContent = match[1].trim();
    const sentences = sectionContent.split(/(?<=[.!?])\s+/);
    return sentences.length > 2;
  }

  return false;
}

async function fetchAllRepos() {
  const allRepos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org: "Algorithm-Arena",
  });

  return allRepos;
}

export async function GET() {
  try {
    const repos = await fetchAllRepos();

    const arenasMap: { [key: number]: Arena } = {};

    await Promise.all(
      repos.map(async (repo) => {
        const readmeResponse = await octokit.rest.repos.getReadme({
          owner: "Algorithm-Arena",
          repo: repo.name,
          mediaType: { format: "raw" },
        });

        const readmeContent: string = readmeResponse.data as unknown as string;
        const challengeNumberMatch = repo.name.match(/weekly-challenge-(\d+)/);
        const challengeNumber = challengeNumberMatch
          ? parseInt(challengeNumberMatch[1], 10)
          : -1;

        const nameMatch = readmeContent.match(/# (.+?) - (.+)/);
        const descriptionMatch = readmeContent.match(
          /\*\*For (?:.*?) challenge, you need to (?:implement|create) (.+?)\*\*/
        );
        const imageUrlMatch = readmeContent.match(
          /<img[^>]+src="([^"]+)"[^>]*>|!\[.*?\]\(([^)]+)\)/
        );
        const deadlineMatch = readmeContent.match(
          /Deadline to submit is (.+?) evening at Midnight PST/
        );

        const arena: Arena = {
          week: challengeNumber,
          url: repo.html_url,
          name: nameMatch ? nameMatch[2].trim() : repo.name,
          description: descriptionMatch
            ? `Implement ${descriptionMatch[1].trim()}`
            : "",
          imgUrl: imageUrlMatch ? imageUrlMatch[1] || imageUrlMatch[2] : "",
          submissionCount: repo.open_issues_count ?? 0,
          judged: false,
          deadline: deadlineMatch ? deadlineMatch[1].trim() : "",
          prizes: parsePrizes(readmeContent),
        };

        arena.judged =
          arena.submissionCount > 0 && detectWinnersSection(readmeContent);

        if (challengeNumber >= 0) {
          arenasMap[challengeNumber] = arena;
        }
      })
    );

    const arenas = Object.keys(arenasMap)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((key) => arenasMap[parseInt(key, 10)]).toReversed();

    return NextResponse.json({ arenas });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch arenas", details: message },
      { status: 500 }
    );
  }
}
