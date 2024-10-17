"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const formSchema = z.object({
  url: z
    .string()
    .url()
    .regex(
      /^https:\/\/github\.com\/Algorithm-Arena\/weekly-challenge-\d+-[a-zA-Z0-9-]+$/,
      {
        message:
          "Enter a valid URL of an Algorithm-Arena Challenge (e.g., https://github.com/Algorithm-Arena/weekly-challenge-1-stockfish-chess)",
      }
    ),
});

function extractRepoName(url: string) {
  const parsedUrl = new URL(url);
  const pathSegments = parsedUrl.pathname.split("/");
  return pathSegments[pathSegments.length - 1];
}

const SubmitChallenge = () => {
  const [submissionResult, setSubmissionResult] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // const response = await fetch("/api/newJudging", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(values),
    // });
    try {
      const challengeId = extractRepoName(values.url);
      if (!challengeId) {
        throw new Error("Url scheme is incorrect");
      }
      console.log(challengeId)
      window.location.href = `/judge/${challengeId}`;
    } catch (error) {
      setSubmissionResult(
        "Cannot extract the repository title for this challenge? Did the url structure change?"
      );
      console.error("Submission error:", error);
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 bg-red-500">
      <h1 className="text-5xl font-extrabold text-white">Arbiter</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                {/* <FormLabel>URL</FormLabel> */}
                <div className="flex justify-center items-center border-2 border-neutral-600 h-14 lg:h-16 rounded-full p-5">
                  <Image
                    src="svg/judge.svg"
                    height={20}
                    width={20}
                    alt="judge)icon"
                    className="opacity-80"
                  />
                  <FormControl>
                    <Input
                      className="border-0 focus-visible:ring-0  text-base font-light text-center text-white"
                      placeholder="Enter The Url Of The Challenge You Wish To Judge"
                      {...field}
                    />
                  </FormControl>
                </div>
                {/* <FormDescription>
                  This is the url to a challenge
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-5 w-full flex flex-col items-center justify-center gap-3">
            {submissionResult && (
              <p className="text-sm text-red-500">{submissionResult}</p>
            )}
            <Button type="submit" className="bg-neutral-800 rounded-none">
              Start Judging
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubmitChallenge;
