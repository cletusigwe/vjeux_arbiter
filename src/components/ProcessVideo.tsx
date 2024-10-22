import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface Props {
  username: string;
  videoId: string;
  setVideoId: (value: string) => void;
}

const ProcessVideo = ({ username, videoId, setVideoId }: Props) => {
  const { toast } = useToast();
  const [isFile, setIsFile] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [hasStartedProcessing, setHasStartedProcessing] = useState(false);
  const [doneProcessing, setDoneProcessing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processVideo() {
    if (!videoUrl && !isFile) {
      toast({
        title: "Validation Error",
        description: `Please provide a valid video URL or upload a video for ${username}.`,
        style: { backgroundColor: "#DC2626", color: "white" },
      });
      return;
    }

    const submissionData = new FormData();
    if (isFile) {
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        submissionData.append("file", fileInput.files[0]);
      } else {
        toast({
          title: "Validation Error",
          description: `Please select a file to upload for ${username}.`,
          style: { backgroundColor: "#DC2626", color: "white" },
        });
        return;
      }
    } else {
      submissionData.append("url", videoUrl);
    }

    setHasStartedProcessing(true);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/process_video", {
        method: "POST",
        body: submissionData,
      });

      if (response.ok) {
        const result = await response.json();
        const videoId = result.videoId;
        setVideoId(videoId);
        toast({
          title: "Video Processing Started",
          description: `${username}'s video is being processed`,
          style: { backgroundColor: "#181818", color: "white" },
        });

        streamLogs(videoId);
      } else {
        throw new Error(`Server response for ${username}'s video was not ok.`);
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description:
          (error as Error).message ||
          `Something went wrong when processing ${username}'s video. Please try again.`,
        style: { backgroundColor: "#DC2626", color: "white" },
      });
    }
  }

  function streamLogs(videoId: string) {
    const eventSource = new EventSource(`/api/process_video?id=${videoId}`);

    eventSource.onmessage = (event) => {
      if (event.data == "END") {
        //end of logs
        eventSource.close();
        setIsProcessing(false);
        setDoneProcessing(true);
      } else if (event.data == "ERROR") {
        eventSource.close();
        setIsProcessing(false);
      } else {
        setLogs((prevLogs) => [...prevLogs, event.data]);
      }

      toast({
        title: `Processing Log For ${username}`,
        description: event.data,
        style: { backgroundColor: "#F59E0B", color: "black" },
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsProcessing(false);
      toast({
        title: "Error",
        description: `Error in receiving logs for ${username}.`,
        style: { backgroundColor: "#DC2626", color: "white" },
      });
    };
  }

  return (
    <div className="flex flex-col w-full max-w-sm space-x-2 gap-3">
      {!doneProcessing && (
        <div
          className={`flex gap-5 ${
            isProcessing
              ? "brightness-50 grayscale opacity-30 pointer-events-none"
              : ""
          } `}
        >
          <Input
            id={`video_for_${username}`}
            ref={fileInputRef}
            type="file"
            className={`file:bg-neutral-400 file:rounded-sm text-neutral-400 ${
              isFile ? "" : "hidden"
            }`}
            placeholder="Upload Demo Video For Processing"
            accept="video/*"
          />
          <Input
            id={`video_for_${username}`}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            type="text"
            placeholder="Enter The Link To The Demo Video For Processing"
            className={`w-96 ${isFile ? "hidden" : ""}`}
          />
          <Button
            type="button"
            onClick={processVideo}
            className="bg-orange hover:bg-orange hover:bg-opacity-70 text-neutral-300"
          >
            Process Video
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-5">
        {!doneProcessing && (
          <div
            className={`flex gap-3 flex-col  ${
              isProcessing
                ? "brightness-50 grayscale opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <div className="flex gap-3">
              <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                I want to upload a file
              </p>
              <Switch
                checked={isFile}
                onCheckedChange={setIsFile}
                className="data-[state=checked]:bg-orange data-[state=unchecked]:bg-neutral-500 opacity-80"
              />
            </div>
            {videoId && (
              <button
                onClick={() => setDoneProcessing(true)}
                className="w-fit flex gap-2 text-xs"
              >
                <span className="text-markdown_blue border-b border-b-markdown_blue">
                  use existing video with id{" "}
                </span>
                <div className="text-green-600 whitespace-nowrap w-24 overflow-clip text-ellipsis">
                  {videoId}
                </div>
              </button>
            )}
          </div>
        )}

        {hasStartedProcessing && (
          <div className=" flex gap-3">
            <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
              Show Video Processing Logs
            </p>
            <Switch
              checked={showLogs}
              onCheckedChange={setShowLogs}
              className="data-[state=checked]:bg-orange data-[state=unchecked]:bg-neutral-500 opacity-80"
            />
          </div>
        )}
      </div>
      {doneProcessing && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-neutral-400">
            <p className="text-xs ">video processed and ready.</p>
            <p className="text-xs ml-5">
              VIDEO_ID is <span className="text-green-600">{videoId}</span>
            </p>
          </div>
          <button
            onClick={() => setDoneProcessing(false)}
            className="w-fit text-xs text-markdown_blue border-b border-b-markdown_blue"
          >
            change video
          </button>
        </div>
      )}

      {showLogs && (
        <div className="mt-4">
          <h3 className="text-sm text-neutral-400 border-b border-b-neutral-600 pb-1 mb-2">
            Video Processing Logs:
          </h3>
          <ul className="text-xs text-neutral-500 flex flex-col gap-2 *:ml-3 *:border-b *:border-b-neutral-600 *:pb-1 max-h-40 overflow-y-scroll">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProcessVideo;
