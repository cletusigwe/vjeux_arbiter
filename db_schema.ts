import z from "zod";

//To help document the schema for the db

export const databaseSchema = z.object({
  twitter_access_token: z.string(),
  twitter_refresh_token: z.string(),
  threads_access_token: z.string(),
  threads_user_id: z.number(),
  github_access_token: z.string(),
});
