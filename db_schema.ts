import z from "zod";

//To help document the schema for the db

const schema = z.object({
  twitter_access_token: z.string(),
});
