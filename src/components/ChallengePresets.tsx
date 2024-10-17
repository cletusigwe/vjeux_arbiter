import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GearIcon } from "@radix-ui/react-icons";
import { UseFormReturn } from "react-hook-form";
import z from "zod";
import { judgeChallengeSchema } from "@/lib/consts";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  formRef: UseFormReturn<z.infer<typeof judgeChallengeSchema>>;
}

const ChallengePresets = ({ formRef }: Props) => {
  return (
    <Dialog>
      <DialogTrigger>
        <GearIcon className="size-5" />
      </DialogTrigger>
      <DialogContent className="bg-grey">
        <DialogHeader>
          <DialogTitle className="border-b-2 w-fit mx-auto border-b-orange">
            Edit The Settings For Announcing The Results
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-between bg-grey">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="twitter">Twitter</TabsTrigger>
            <TabsTrigger value="threads">Theads</TabsTrigger>
            <TabsTrigger value="meta_workplace">Workplace</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-5 flex flex-col gap-5">
            <FormField
              control={formRef.control}
              name="postIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Intro</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px]"
                      placeholder="I thought I was clever to ask people to write a Mini Golf game as Code Golf but had no idea what to expect. The results have been amazing! Check out this thread to see the creativity of the 5 submissions this week"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="firstIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winner Recognition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="In first place" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="secondIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Runner-up Recognition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="In second place" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="thirdIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second-Runner-Up Recognition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="In third place" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="otherIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Participants Recognition</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="As honorable mention" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="nextChallengeIntro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Challenge Intro</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[50px]"
                      placeholder="If this was fun for you, you can try out this week's challenge"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="twitter" className="mt-5 flex flex-col gap-5">
            <FormField
              control={formRef.control}
              name="twitterAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://x.com/Vjeux/status/1772292188698739172"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="twitterNextAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://x.com/Vjeux/status/1774815302712492201"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="threads" className="mt-5 flex flex-col gap-5">
            <FormField
              control={formRef.control}
              name="threadsAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://threads.net/Vjeux/status/1772292188698739172"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="threadsNextAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://threads.net/Vjeux/status/1774815302712492201"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent
            value="meta_workplace"
            className="mt-5 flex flex-col gap-5"
          >
            <FormField
              control={formRef.control}
              name="meta_workplaceAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.workplace.com/Vjeux/status/1772292188698739172"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formRef.control}
              name="meta_workplaceNextAnnounceLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Challenge Announcement Link</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.workplace.com/Vjeux/status/1774815302712492201"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengePresets;
