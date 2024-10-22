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
  position: number;
  socials: { provider: string; url: string }[];
  issueLink: string;
  githubUserName: string;
  githubProfileUrl: string;
  comment: string;
  videoId: string;
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
  // meta_workplaceAnnounceLink: string;
  // meta_workplaceNextAnnounceLink: string;
}

export interface ChallengeAnnouncementData extends JudgeResult {
  submissionData: SubmissionData[];
  postToWebsite: "twitter" | "threads" | "";
}
export const singleSubmissionSchema = z.object({
  comment: z.string().min(2),
  videoId: z.string().min(2),
});

export const judgeChallengeSchema = z.object({
  postIntro: z.string().min(2),
  firstIntro: z.string().min(2),
  secondIntro: z.string().min(2),
  thirdIntro: z.string().min(2),
  otherIntro: z.string().min(2),
  nextChallengeIntro: z.string().min(2),
  twitterAnnounceLink: z.string().url(),
  twitterNextAnnounceLink: z.string().url(),
  threadsAnnounceLink: z.string().url(),
  threadsNextAnnounceLink: z.string().url(),
  // meta_workplaceAnnounceLink: z.string().url(),
  // meta_workplaceNextAnnounceLink: z.string().url(),
});

export const newChallengeSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  inspiration: z.string().min(2),
  social_media_post: z.string(),
  challenge_image: z.instanceof(File),
  first_reward: z.coerce.number().min(0),
  second_reward: z.coerce.number().min(0),
  third_reward: z.coerce.number().min(0),
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
