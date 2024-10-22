import z from "zod";

//To help document the schema for the db

export const databaseSchema = z.object({
  twitter_access_token: z.string(),
  twitter_refresh_token: z.string(),
  // twitter_auth_timestamp:
  threads_access_token: z.string(),
  threads_user_id: z.number(),
  github_access_token: z.string(),
  // threads_auth_timestamp:
  //todo store expiry dates so you can prompt auth when tokens expire
});
