import z from "zod";
export interface IssueData {
  authorUsername: string;
  authorProfileUrl: string;
  authorAvatarUrl: string;
  issueTitle: string;
  issueCreatedAt: string;
  issueContent: string;
  issueUrl: string;
  socials: { provider: string; url: string }[];
}

export interface ChallengeResult {
  issuesData: IssueData[];
  deadline: string | null;
  prizes: [number, number, number];
}
export interface SubmissionData {
  comment: string;
  videoPath: string;
}
export interface JudgeResult {
  postIntro: string;
  firstIntro: string;
  secondIntro: string;
  thirdIntro: string;
  otherIntro: string;
  nextChallengeIntro: string;
  twitterAnnounceLink: string;
  twitterNextAnnounceLink: string;
  threadsAnnounceLink: string;
  threadsNextAnnounceLink: string;
  meta_workplaceAnnounceLink: string;
  meta_workplaceNextAnnounceLink: string;
}
export const singleSubmissionSchema = z.object({
  comment: z.string(),
  videoPath: z.string(),
});

export const judgeChallengeSchema = z.object({
  postIntro: z.string(),
  firstIntro: z.string(),
  secondIntro: z.string(),
  thirdIntro: z.string(),
  otherIntro: z.string(),
  nextChallengeIntro: z.string(),
  twitterAnnounceLink: z.string().url(),
  twitterNextAnnounceLink: z.string().url(),
  threadsAnnounceLink: z.string().url(),
  threadsNextAnnounceLink: z.string().url(),
  meta_workplaceAnnounceLink: z.string().url(),
  meta_workplaceNextAnnounceLink: z.string().url(),
});

export const newChallengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  inspiration: z.string(),
  social_media_post: z.string(),
  challenge_image: z.instanceof(File),
  first_reward: z.number(),
  second_reward: z.number(),
  third_reward: z.number(),
});

export interface Arena {
  week: number;
  url: string;
  name: string;
  description: string;
  imgUrl: string;
  submissionCount: number;
  judged: boolean;
  deadline: string;
  prizes: [number, number, number];
}
