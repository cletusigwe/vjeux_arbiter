import fs from "fs/promises";
import OAuth from "oauth-1.0a";
import { createHmac } from "crypto";

const MEDIA_ENDPOINT_URL = "https://upload.twitter.com/1.1/media/upload.json";

const oauth = new OAuth({
  consumer: {
    key: process.env.TWITTER_CONSUMER_KEY!.trim(),
    secret: process.env.TWITTER_CONSUMER_SECRET!.trim(),
  },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return createHmac("sha1", key).update(base_string).digest("base64");
  },
});

async function uploadInit(totalBytes: number): Promise<string> {
  console.log("UPLOAD INIT", totalBytes, totalBytes.toString());
  const request_data = {
    url: MEDIA_ENDPOINT_URL,
    method: "POST",
    data: {
      command: "INIT",
      total_bytes: totalBytes.toString(),
      media_type: "video/mp4",
      media_category: "tweet_video",
    },
  };

  const authorization = oauth.authorize(request_data, {
    key: process.env.TWITTER_ACCESS_TOKEN!.trim(),
    secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!.trim(),
  });

  const response = await fetch(MEDIA_ENDPOINT_URL, {
    method: "POST",
    headers: {
      ...oauth.toHeader(authorization),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(request_data.data),
  });

  const data = await response.json();
  // console.log(data);
  return data.media_id;
}

async function uploadAppend(
  mediaId: string,
  chunk: Buffer,
  segmentIndex: number
): Promise<boolean> {
  console.log("UPLOAD APPEND", mediaId, chunk.length, segmentIndex);
  const formData = new FormData();
  formData.append("command", "APPEND");
  formData.append("media_id", mediaId);
  formData.append("segment_index", segmentIndex.toString());
  formData.append("media", new Blob([chunk]));

  const request_data = {
    url: MEDIA_ENDPOINT_URL,
    method: "POST",
    data: formData,
  };

  const authorization = oauth.authorize(request_data, {
    key: process.env.TWITTER_ACCESS_TOKEN!.trim().trim(),
    secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!.trim().trim(),
  });

  const response = await fetch(MEDIA_ENDPOINT_URL, {
    method: "POST",
    headers: {
      ...oauth.toHeader(authorization),
    },
    body: formData,
  });
  console.log(await response.text());
  return response.ok;
}

async function uploadFinalize(mediaId: string) {
  console.log("UPLOAD FINALIZE", mediaId);

  const request_data = {
    url: MEDIA_ENDPOINT_URL,
    method: "POST",
    data: {
      command: "FINALIZE",
      media_id: mediaId,
    },
  };

  const authorization = oauth.authorize(request_data, {
    key: process.env.TWITTER_ACCESS_TOKEN!.trim(),
    secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!.trim(),
  });

  const response = await fetch(MEDIA_ENDPOINT_URL, {
    method: "POST",
    headers: {
      ...oauth.toHeader(authorization),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(request_data.data),
  });

  const data = await response.json();
  return data;
}

export async function uploadVideo(videoPath: string): Promise<string> {
  const fileStats = await fs.stat(videoPath);
  const totalBytes = fileStats.size;
  let bytesCount = 0;
  const mediaId = await uploadInit(totalBytes);

  const chunkSize = 4 * 1024 * 1024; // 4MB chunks
  let segmentIndex = 0;
  const fileHandle = await fs.open(videoPath, "r");
  for (let i = 0; i < totalBytes; i += chunkSize) {
    const { buffer, bytesRead } = await fileHandle.read(
      Buffer.alloc(chunkSize),
      0,
      chunkSize,
      i
    );
    bytesCount += bytesRead;
    console.log("READ ", bytesRead, " bytes ", bytesCount, "/", totalBytes);
    const appendResult = await uploadAppend(mediaId, buffer, segmentIndex++);
    if (!appendResult) {
      //TODO if I eventually find the bug,then implement failed chunk re-uploads
      throw new Error(`APPEND FAILED FOR CHUNK ${segmentIndex}. exiting...`);
    }
  }
  await fileHandle.close();
  const finalizeResult = await uploadFinalize(mediaId);
  console.log(
    "MEDIA ID is",
    mediaId,
    " and finalize result returned ",
    finalizeResult
  );

  return mediaId;
}
