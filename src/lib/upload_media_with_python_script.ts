import { exec } from "child_process";
import path from "path";

async function executeUpload(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Python Error: ${stderr}`);
        return reject(new Error(stderr));
      }

      try {
        const pyResult = JSON.parse(stdout);

        if (pyResult.final_state === "ERROR") {
          pyResult.logs.forEach((log: string) => console.log(log));
          return reject(new Error("Upload failed"));
        } else {
          const mediaId = pyResult.final_state.split(" ")[1]; // Extract media ID
          resolve(mediaId);
        }
      } catch (parseError) {
        console.error(`JSON Parse Error: ${(parseError as Error).message}`);
        reject(parseError);
      }
    });
  });
}

function buildCommand(mediaType: "image" | "video", mediaPath: string): string {
  const mediaFlag =
    mediaType === "image" ? "--image_filename" : "--video_filename";
  return `${process.env.PYTHON_PATH} ${path.join(
    process.cwd(),
    "src/lib/upload_media.py"
  )} \
  --consumer_key ${process.env.TWITTER_CONSUMER_KEY} \
  --consumer_secret ${process.env.TWITTER_CONSUMER_SECRET} \
  --access_token ${process.env.TWITTER_ACCESS_TOKEN} \
  --access_token_secret ${process.env.TWITTER_ACCESS_TOKEN_SECRET} \
  ${mediaFlag} ${mediaPath}`;
}

export async function uploadImage(imagePath: string): Promise<string> {
  const command = buildCommand("image", imagePath);
  return executeUpload(command);
}

export async function uploadVideo(videoPath: string): Promise<string> {
  const command = buildCommand("video", videoPath);
  return executeUpload(command);
}
