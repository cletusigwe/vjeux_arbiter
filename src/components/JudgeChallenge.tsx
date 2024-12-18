"use client";
import { useState, useRef, act } from "react";
import Submission from "./Submission";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import ChallengePresets from "./ChallengePresets";
import FinalTouches from "./FinalTouches";
import type {
  ChallengeAnnouncementData,
  ChallengeResult,
  SubmissionData,
} from "@/lib/consts";
import { judgeChallengeSchema, singleSubmissionSchema } from "@/lib/consts";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface Props {
  deadline: ChallengeResult["deadline"];
  submissions: ChallengeResult["issuesData"];
  setSubmissions: Dispatch<
    SetStateAction<ChallengeResult["issuesData"] | null>
  >;
  repo: string;
  prizes: ChallengeResult["prizes"];
}

const JudgeChallenge = ({
  submissions,
  setSubmissions,
  repo,
  deadline,
  prizes,
}: Props) => {
  const { toast } = useToast();

  const [submissionData, setSubmissionData] = useState<SubmissionData[]>(
    submissions.map((submission, index) => ({
      position: index,
      socials: submission.socials,
      issueLink: submission.issueUrl,
      githubUserName: submission.authorUsername,
      githubProfileUrl: submission.authorProfileUrl,
      comment: "",
      videoInfo: { id: "", url: "" },
      // videoUrl: "",
      // videoId: `${index + 1} video`,
    }))
  );
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof judgeChallengeSchema>>({
    resolver: zodResolver(judgeChallengeSchema),
    defaultValues: {
      postIntro: "",
      firstIntro: `The winner for $${prizes[0]}`,
      secondIntro: `In second place for $${prizes[1]}`,
      thirdIntro: `In third place for $${prizes[2]}`,
      otherIntro: "As honourable mention",
      nextChallengeIntro:
        "If this was fun for you, you can try out this week's challenge",
      twitterAnnounceLink: "",
      twitterNextAnnounceLink: "",
      threadsAnnounceLink: "",
      threadsNextAnnounceLink: "",

      // twitterAnnounceLink: "https://x.com/Vjeux/status/1843306532219539839",
      // twitterNextAnnounceLink: "https://x.com/Vjeux/status/1843306532219539839",
      // threadsAnnounceLink: "https://www.threads.net/@vjeux/post/DA08w9RPjd_",
      // threadsNextAnnounceLink:
      //   "https://www.threads.net/@vjeux/post/DA08w9RPjd_",
      // meta_workplaceAnnounceLink: "",
      // meta_workplaceNextAnnounceLink: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof judgeChallengeSchema>) => {
    setIsSubmitting(true);
    const errors: string[] = [];

    Object.keys(values).forEach((key) => {
      const fieldErrors =
        form.formState.errors[key as keyof typeof values]?.message;
      if (fieldErrors) {
        errors.push(`${key}: ${fieldErrors}`);
      }
    });

    submissionData.forEach((submission, index) => {
      const commentResult = singleSubmissionSchema.shape.comment.safeParse(
        submission.comment
      );

      const videoIdResult = singleSubmissionSchema.shape.videoId.safeParse(
        submission.videoInfo.id
      );
      // const videoUrlResult = singleSubmissionSchema.shape.videoId.safeParse(
      //   submission.videoInfo.url
      // );

      if (!commentResult.success) {
        errors.push(
          `${submissions[index].authorUsername}'s submision has: Invalid comment`
        );
      }
      if (!videoIdResult.success) {
        errors.push(
          `${submissions[index].authorUsername}'s submision has: Invalid video id. Process the video to generate an id`
        );
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="mt-2 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    //First post to twitter, then threads
    const combinedData: ChallengeAnnouncementData = {
      ...values,
      submissionData,
      repo: repo,
      prizes: prizes,
      postToWebsite: "",
    };
    //https://youtu.be/GF2TWet47-0?si=oLtKKclBhVkyu13C

    // console.log(combinedData)
    for (const website of ["github", "twitter", "threads"]) {
      toast({
        title: `Announcing results on ${website}`,
        description: "Watch the server logs for realtime info",
        style: { backgroundColor: "#F59E0B", color: "black" },
      });
      // await new Promise((resolve) => setTimeout(resolve, 15000));
      // continue;
      combinedData.postToWebsite = website as "threads" | "twitter" | "github";
      const announcement = await fetch("/api/announce_winners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...combinedData }),
      });

      if (announcement.ok) {
        const { url } = await announcement.json();
        toast({
          title: `Successfully sent post to ${website}`,
          description: (
            <a
              href={url}
              target="_blank"
              className="text-markdown_blue border-b border-b-markdown_blue w-fit mx-auto"
            >
              Check it out here
            </a>
          ),
          style: { backgroundColor: "#16A34A", color: "white" },
        });
      } else {
        toast({
          title: `Posting announcement for ${website} failed`,
          description: "Check Server Logs For More Details",
          variant: "destructive",
        });
      }
    }

    setIsSubmitting(false);
  };

  const updateSubmissionData = (
    index: number,
    field: keyof SubmissionData,
    value: SubmissionData[keyof SubmissionData]
  ) => {
    setSubmissionData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  function handleDragStart(event: DragStartEvent) {
    // console.log("start", event);
    setActiveId(parseInt(event.active.id as string, 10));
  }
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveId(null);

    // console.log(active, over);

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id as string, 10);
      const newIndex = parseInt(over.id as string, 10);

      setSubmissions((submissions) => {
        if (submissions) {
          const newSubmissions = arrayMove(submissions, oldIndex, newIndex);
          const newSubmissionData = arrayMove(
            submissionData,
            oldIndex,
            newIndex
          );
          setSubmissionData(newSubmissionData);
          return newSubmissions;
        }
        return null;
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="size-full p-3">
        <div className="w-full lg:max-w-[70%] lg:mx-auto flex justify-between items-center mb-5 ">
          <div className="flex flex-col">
            <h1 className="text-center ">
              <span className="font-bold capitalize border-b-2 border-b-orange">
                {(repo as string).split("-").join(" ")}
              </span>
              <span className="mx-2 text-xs font-semibold text-green-600">
                {submissions.length} submissions
              </span>
            </h1>
            <span className="text-xs text-neutral-400">
              Deadine: {deadline}
            </span>
          </div>
          <div
            className={`flex gap-8 items-center ${
              isSubmitting
                ? "brightness-50 grayscale opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <ChallengePresets formRef={form} />
            <FinalTouches formRef={form} onSubmit={onSubmit} />
            {/**forms are submitted here**/}
          </div>
        </div>

        <div
          className={`w-full lg:max-w-[70%] lg:mx-auto  ${
            isSubmitting
              ? "brightness-50 grayscale opacity-30 pointer-events-none"
              : ""
          }`}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={submissions.map((_, index) => {
                return index.toString();
              })}
              strategy={verticalListSortingStrategy}
            >
              {submissions.map((submission, index) => (
                <Submission
                  key={submission.authorUsername}
                  position={index}
                  {...submission}
                  comment={submissionData[index].comment}
                  setComment={(value) =>
                    updateSubmissionData(index, "comment", value)
                  }
                  videoInfo={submissionData[index].videoInfo}
                  setVideoInfo={(value) => {
                    updateSubmissionData(index, "videoInfo", value);
                  }}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <Submission
                  position={activeId}
                  {...submissions[activeId]}
                  comment={submissionData[activeId].comment}
                  setComment={(value) =>
                    updateSubmissionData(activeId, "comment", value)
                  }
                  videoInfo={submissionData[activeId].videoInfo}
                  setVideoInfo={(value) => {
                    updateSubmissionData(activeId, "videoInfo", value);
                  }}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </form>
    </Form>
  );
};

export default JudgeChallenge;
