"use client";
import { newChallengeSchema } from "@/lib/consts";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CreateNewChallenge = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof newChallengeSchema>>({
    resolver: zodResolver(newChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      inspiration: "",
      social_media_post: "",
      challenge_image: new File([], ""),
    },
  });

  async function onSubmit(values: z.infer<typeof newChallengeSchema>) {
    const formData = new FormData();

    for (const key of Object.keys(values) as Array<keyof typeof values>) {
      formData.append(key, values[key] as string | File);
    }

    const response = await fetch("/api/new_challenge", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast({
        title: "Error creating new challenge:",
        description: response.statusText,
        style: { backgroundColor: "#DC2626", color: "white" },
      });
      return;
    }
    const result = await response.json();
    if (result.repoUrl) {
      window.location.href = result.repoUrl;
    }
  }
  return (
    <div className="flex flex-col items-center">
      <Form {...form}>
        <h1 className="border-b-2 border-b-orange w-fit mx-auto text-lg font-bold">
          Create New Algorithm Arena Challenge
        </h1>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 min-w-[700px]"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="ARC not AGI" {...field} />
                </FormControl>
                <FormDescription>
                  What is the name of this challenge?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Implement a program that solves 3 ARC-AGI problems of your choosing."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What should participants implement?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inspiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspiration</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="I've been fascinated by the ARC-AGI challenge that is giving 1 million dollars if you're able to create a program that solves 100 private puzzles, they share the same structure as 800 puzzles that are public. I started live streaming solving the 800 puzzles and I figured it may be a good challenge :)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>What inspired this challenge?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_media_post"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Media Post</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px]"
                    placeholder="ARC-AGI is giving 1 million dollars for whoever makes a program that solves 100 hidden problems. If you want a get a taste of it, this week challenge is to solve just 3 of the public problems. Not AI needed!"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Content of post that announce the new challenge on social
                  media
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="challenge_image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Illustrating Image</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="file:bg-neutral-400 file:rounded-sm text-neutral-400 "
                  />
                </FormControl>
                <FormDescription>
                  Image that illustrates this challenge nicely
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="first_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Award for 1st Position</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormDescription>
                  Amount in dollars to be awarded to winner
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="second_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Award for 2nd Position</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="60" {...field} />
                </FormControl>
                <FormDescription>
                  Amount in dollars to be awarded to runner-up
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="third_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Award for 3rd Position</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="40" {...field} />
                </FormControl>
                <FormDescription>
                  Amount in dollars to be awarded to second runner-up
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-orange hover:bg-orange hover:bg-opacity-80 rounded-sm"
            >
              Publish Challenge
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateNewChallenge;
