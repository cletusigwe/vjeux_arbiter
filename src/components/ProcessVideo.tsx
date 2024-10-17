import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface Props {
  username: string;
  onVideoPathChange: (value: string) => void;
}

const ProcessVideo = ({ username, onVideoPathChange }: Props) => {
  const { toast } = useToast();
  const [isFile, setIsFile] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processVideo() {
    if (!videoUrl && !isFile) {
      toast({
        title: "Validation Error",
        description: "Please provide a valid video URL or upload a file.",
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
          description: "Please select a file to upload.",
          style: { backgroundColor: "#DC2626", color: "white" },
        });
        return;
      }
    } else {
      submissionData.append("url", videoUrl);
    }
    onVideoPathChange("result.processedVideoPath");

    // try {
    //   const response = await fetch("/api/process_video", {
    //     method: "POST",
    //     body: submissionData,
    //   });

    //   if (response.ok) {
    //     const result = await response.json();
    //     if (result.processedVideoPath) {
    //       onVideoPathChange(result.processedVideoPath);
    //       toast({
    //         title: "Video Processing Started",
    //         description: `${username}'s video is being processed`,
    //         style: { backgroundColor: "#181818", color: "white" },
    //       });
    //     } else {
    //       throw new Error("Processed video path not received from server.");
    //     }
    //   } else {
    //     throw new Error("Server response was not ok.");
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: `Something went wrong when processing ${username}'s video. Please try again.`,
    //     style: { backgroundColor: "#DC2626", color: "white" },
    //   });
    // }
  }
  return (
    <div className="flex flex-col w-full max-w-sm space-x-2 gap-3">
      <div className="flex gap-5">
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
      <div className="flex items-center gap-3">
        <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
          I want to upload a file
        </p>
        <Switch
          checked={isFile}
          onCheckedChange={setIsFile}
          className="data-[state=checked]:bg-orange data-[state=unchecked]:bg-neutral-500 opacity-80"
        />
      </div>
    </div>
  );
};

export default ProcessVideo;
