"use client";
import { useState, useRef } from "react";
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
  ChallengeResult,
  JudgeResult,
  SubmissionData,
} from "@/lib/consts";
import { judgeChallengeSchema, singleSubmissionSchema } from "@/lib/consts";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "./ui/button";
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
      comment: "",
      videoPath: "",
    }))
  );
  const [activeId, setActiveId] = useState<number | null>(null);

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
      meta_workplaceAnnounceLink: "",
      meta_workplaceNextAnnounceLink: "",
    },
  });

  const onSubmit = (values: z.infer<typeof judgeChallengeSchema>) => {
    console.log("form knows to submit");
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
      const videoPathResult = singleSubmissionSchema.shape.videoPath.safeParse(
        submission.videoPath
      );

      if (!commentResult.success) {
        errors.push(
          `${submissions[index].authorUsername}'s submision has: Invalid comment`
        );
      }
      if (!videoPathResult.success) {
        errors.push(
          `${submissions[index].authorUsername}'s submision has: Invalid video path`
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
      return;
    }

    const combinedData = {
      ...values,
      submissionData,
    };
    console.log("Combined Data:", combinedData);
    // TODO submission logic here
  };

  const updateSubmissionData = (
    index: number,
    field: keyof SubmissionData,
    value: string
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
    setActiveId(parseInt(event.active.id as string, 10));
  }
  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);

    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSubmissions((submissions) => {
        if (submissions) {
          const oldIndex = parseInt(active.id as string, 10);
          const newIndex = parseInt(over.id as string, 10);
          return arrayMove(submissions, oldIndex, newIndex);
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
          <div className="flex gap-8 items-center ">
            <ChallengePresets formRef={form} />
            <FinalTouches formRef={form} onSubmit={onSubmit} />
            {/**forms are submitted here**/}
          </div>
        </div>

        <div className="w-full lg:max-w-[70%] lg:mx-auto ">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={submissions.map((_, index) => index.toString())}
              strategy={verticalListSortingStrategy}
            >
              {submissions.map((submission, index) => (
                <Submission
                  key={index}
                  position={index}
                  {...submission}
                  comment={submissionData[index].comment}
                  onCommentChange={(value) =>
                    updateSubmissionData(index, "comment", value)
                  }
                  onVideoPathChange={(value) =>
                    updateSubmissionData(index, "videoPath", value)
                  }
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <Submission
                  position={activeId}
                  {...submissions[activeId]}
                  comment={submissionData[activeId].comment}
                  onCommentChange={(value) =>
                    updateSubmissionData(activeId, "comment", value)
                  }
                  onVideoPathChange={(value) =>
                    updateSubmissionData(activeId, "videoPath", value)
                  }
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