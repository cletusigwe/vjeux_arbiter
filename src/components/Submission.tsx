"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Grip } from "lucide-react";
import AddComment from "./AddComment";
import ProcessVideo from "./ProcessVideo";
import Image from "next/image";
import type { IssueData, VideoInfo } from "@/lib/consts";
import Markdown from "react-markdown";

interface Props extends IssueData {
  position: number;
  comment: string;
  setComment: (value: string) => void;
  videoInfo: VideoInfo;
  setVideoInfo: (value: VideoInfo) => void;
}
function formatIsoDate(isoString: string) {
  // Split the date and time components
  const [datePart, timePart] = isoString.split("T");

  // Format the date
  const [year, month, day] = datePart.split("-");

  // Format the time and remove the "Z"
  const time = timePart.replace("Z", "");

  // Define a mapping for month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Format the final output as "30th March, 2024"
  return `${parseInt(day)}${getDaySuffix(parseInt(day))} ${
    monthNames[parseInt(month) - 1]
  }, ${year} ${time}`;
}
function getDaySuffix(day: number) {
  const j = day % 10;
  const k = day % 100;
  if (j == 1 && k != 11) {
    return "st";
  }
  if (j == 2 && k != 12) {
    return "nd";
  }
  if (j == 3 && k != 13) {
    return "rd";
  }
  return "th";
}

const Submission = ({
  position,
  authorUsername,
  authorProfileUrl,
  authorAvatarUrl,
  issueTitle,
  issueCreatedAt,
  issueContent,
  issueUrl,
  comment,
  setComment,
  videoInfo,
  setVideoInfo,
}: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: position.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-no-dnd="false"
      className="w-full h-fit mb-12 flex items-end"
    >
      <div className="border  border-neutral-700 p-3 flex-grow">
        <div className="mb-10 flex items-center gap-16 pb-2  border-b-2  border-b-neutral-500">
          <a
            href={authorProfileUrl}
            target="_blank"
            className="flex justify-between items-center gap-4"
          >
            <Image
              src={authorAvatarUrl}
              width={30}
              height={30}
              alt={authorUsername}
              className="bg-orange rounded-full"
            />
            <div className="flex items-center gap-1">
              <span className="text-neutral-400 text-xs">{authorUsername}</span>
              {[1, 2, 3].includes(position + 1) && (
                <Image
                  src={`/images/medal_${position + 1}.png`}
                  width={20}
                  height={20}
                  alt="award visualisation"
                  className="brightness-75"
                />
              )}
            </div>
          </a>
          <div className="flex items-center justify-between flex-grow">
            <div className=" flex flex-col items-center">
              <span className="font-bold">{issueTitle}</span>
              <span className="text-xs">{formatIsoDate(issueCreatedAt)}</span>
            </div>
            <a
              href={issueUrl}
              target="_blank"
              className="text-xs text-blue-400"
            >
              view on github
            </a>
          </div>
        </div>
        <Collapsible
          open={showDetails}
          onOpenChange={setShowDetails}
          className="flex gap-2  justify-center"
        >
          <CollapsibleContent>
            <div className="markdownContent">
              <Markdown>{issueContent}</Markdown>
            </div>
          </CollapsibleContent>
          <CollapsibleTrigger
            className={`${
              showDetails
                ? "h-full"
                : "w-full flex items-center gap-5 justify-end bg-neutral-800"
            }`}
          >
            {!showDetails && (
              <p className="text-sm text-neutral-400">
                Click to show submission details
              </p>
            )}
            <div className="bg-neutral-800 p-1 rounded-sm">
              {showDetails ? (
                <ChevronUpIcon
                  stroke="#A3A3A3"
                  strokeWidth={"2px"}
                  className="size-6"
                />
              ) : (
                <ChevronDownIcon
                  stroke="#A3A3A3"
                  strokeWidth={"2px"}
                  className="size-6"
                />
              )}
            </div>
          </CollapsibleTrigger>
        </Collapsible>
        <div className="w-full mt-10 flex justify-between">
          <ProcessVideo
            username={authorUsername}
            videoInfo={videoInfo}
            setVideoInfo={setVideoInfo}
          />
          <div className="flex h-fit">
            <p className="font-semibold text-neutral-500 mx-5 text-sm h-fit">
              Add Comment:
            </p>
            <AddComment
              username={authorUsername}
              setComment={setComment}
              comment={comment}
            />
          </div>
        </div>
      </div>
      <div {...listeners} className="bg-neutral-800 p-1 cursor-grabbing">
        <Grip className="size-8 text-neutral-400" />
      </div>
    </div>
  );
};

export default Submission;
