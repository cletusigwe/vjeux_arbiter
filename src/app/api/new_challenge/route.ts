import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { newChallengeSchema } from "@/lib/consts";
import path from "path";
import sharp from "sharp";

const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
});

function getDeadline() {
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));
  return nextSunday.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
function lowercaseFirstLetter(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const parsedData = newChallengeSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      inspiration: formData.get("inspiration"),
      social_media_post: formData.get("social_media_post"),
      challenge_image: formData.get("challenge_image") as File,
      first_reward: Number(formData.get("first_reward")),
      second_reward: Number(formData.get("second_reward")),
      third_reward: Number(formData.get("third_reward")),
    });

    const {
      title,
      description,
      inspiration,
      social_media_post,
      challenge_image,
      first_reward,
      second_reward,
      third_reward,
    } = parsedData;

    const challengeImageBuffer = Buffer.from(
      await challenge_image.arrayBuffer()
    );
    const challengeImageExtension = challenge_image.name.split(".").pop();

    const imageContent = challengeImageBuffer.toString("base64");

    const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
      org: "Algorithm-Arena",
    });
    const weekNumber = repos.length + 1;
    const imageFilePath = path.join(
      process.cwd(),
      "challenge_images",
      `week_${weekNumber}.jpg`
    );
    await sharp(challengeImageBuffer).toFormat("jpg").toFile(imageFilePath);

    const { data: repoData } = await octokit.repos.createForAuthenticatedUser({
      name: `weekly-challenge-${weekNumber}-${title
        .toLowerCase()
        .split(" ")
        .join("-")}`,
      private: false,
      description: `${title} #${weekNumber}`,
    });

    const readmeContent =
      "# Weekly Challenge #" +
      weekNumber +
      " - " +
      title +
      "\n\n" +
      "**For this challenge, you need to " +
      lowercaseFirstLetter(description) +
      ".** " +
      inspiration +
      "\n\n" +
      '<img width="506" alt="Challenge Image" src="https://github.com/' +
      repoData.owner.login +
      "/" +
      repoData.name +
      "/raw/main/illustration." +
      challengeImageExtension +
      '" />\n\n' +
      "### Prizes:\n" +
      "* Winner: $" +
      first_reward +
      "\n" +
      "* 2nd: $" +
      second_reward +
      "\n" +
      "* 3rd: $" +
      third_reward +
      "\n\n" +
      "### Rules:\n" +
      "* The winners will be evaluated based on how creative and interesting the solution is. @vjeux has full discretion on how the winners are selected.\n" +
      "* Multiple people can work on a single submission. If it wins, the reward will be split based on the team preferences.\n" +
      "* If a winner doesn't want to take the money, it'll be reinjected in the next week prize pool.\n" +
      "* The solution must be open sourced.\n" +
      "* There are no restrictions in terms of tech stack.\n\n" +
      "### How to submit a solution:\n" +
      "* Deadline to submit is " +
      getDeadline() +
      " evening at Midnight PST (US West Coast).\n" +
      '* Open an issue on this repo titled "Submission - &lt;Name of your submission&gt;"\n' +
      "* It must contain a short video showing the submission in action\n" +
      "* It must contain an explanation on how to try it\n" +
      "* It must contain a link with the source code";

    await octokit.repos.createOrUpdateFileContents({
      owner: repoData.owner.login,
      repo: repoData.name,
      path: "README.md",
      message: "Initial commit with README.md",
      content: Buffer.from(readmeContent).toString("base64"),
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: repoData.owner.login,
      repo: repoData.name,
      path: `illustration.${challengeImageExtension}`,
      message: "Add challenge image",
      content: imageContent,
    });
    const imageUrl = `https://raw.githubusercontent.com/${repoData.owner.login}/${repoData.name}/refs/heads/main/illustration.${challengeImageExtension}`;
    //upload to twitter and threads
    const twitterPostResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/tweet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tweets: [
            { tweet: social_media_post, imageFilePath },
            {
              post: `Check out the full details and how to submit:\n${repoData.html_url}`,
            },
          ],
        }),
      }
    );
    const twitterPostJson = await twitterPostResult.json();
    console.log(twitterPostJson.message);
    const url =
      "https://github.com/cletusigwe/weekly-challenge-38-agi-in-brainfuck";
    const threadsPostResult = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/threads/post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posts: [
            { post: social_media_post, imageUrl },
            {
              post: `Check out the full details and how to submit:\n${url}`,
            },
          ],
        }),
      }
    );
    const threadsPostJson = await threadsPostResult.json();
    console.log(threadsPostJson.message);

    return NextResponse.json({
      repoUrl: repoData.html_url,
      tweetUrl: twitterPostJson.tweetUrl,
      threadsUrl: threadsPostJson.tweetUrl,
    });
  } catch (error: any) {
    console.error("Error creating repository or file:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
