import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { createWriteStream, createReadStream, watch } from "fs";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Utility function to convert a web ReadableStream to a Node.js Readable stream
const webToNodeStream = (webStream: ReadableStream<Uint8Array>) => {
  const reader = webStream.getReader();
  const nodeStream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(Buffer.from(value));
      }
    },
  });
  return nodeStream;
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const fileData = formData.get("file") || formData.get("url");
  const isFile = typeof fileData !== "string";
  let fileName = "";

  if (!fileData) {
    return NextResponse.json(
      { error: "File or URL is required" },
      { status: 400 }
    );
  }

  const videoId = uuidv4();

  const logFilePath = path.resolve(process.cwd(), `logs/${videoId}.log`);
  const logStream = createWriteStream(logFilePath, { flags: "a" });

  if (isFile) {
    fileName = `downloaded_videos/${videoId}.${fileData.name.split(".").pop()}`;
    logStream.write(
      `Saving the uploaded file with name: ${fileData.name} into ${fileName}\n`
    );
    const savedFilePath = path.resolve(process.cwd(), fileName);

    const fileStream = webToNodeStream(fileData.stream());

    // Create a writable stream to save the uploaded file
    const writeStream = fs.createWriteStream(savedFilePath);

    await new Promise((resolve, reject) => {
      fileStream.pipe(writeStream).on("finish", resolve).on("error", reject);
    });
  }

  const args =
    typeof fileData === "string"
      ? ["-u", fileData, "-o", videoId]
      : ["-f", fileName, "-o", videoId];

  const userVideoProcess = spawn("bash", ["./process_video.sh", ...args]);

  userVideoProcess.stdout.on("data", (data) =>
    logStream.write(data.toString())
  );
  userVideoProcess.stderr.on("data", (data) =>
    logStream.write(data.toString())
  );

  userVideoProcess.on("close", (code) => {
    if (code == 0) {
      logStream.write("END");
    } else {
      logStream.write("ERROR");
    }
    logStream.end();
    console.log(`Process exited with code ${code}`);
  });

  // Return the video ID so that the client can use it to fetch logs
  return NextResponse.json({ videoId });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const videoId = url.searchParams.get("id");

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 }
    );
  }

  const logFilePath = path.resolve(process.cwd(), `logs/${videoId}.log`);

  const responseHeaders = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const stream = new Readable({
    read() {},
  });

  const initialStream = createReadStream(logFilePath, {
    encoding: "utf8",
  });

  initialStream.on("data", (chunk: string) => {
    const lines = chunk
      .split("\n")
      .filter((line: string) => line.trim() !== "");
    lines.forEach((line: string) => {
      stream.push(`data: ${line}\n\n`);
    });
  });

  initialStream.on("end", () => {
    // After initial logs are sent, watch for new logs
    const watcher = watch(logFilePath, (eventType) => {
      if (eventType === "change") {
        const newStream = createReadStream(logFilePath, {
          encoding: "utf8",
          start: initialStream.bytesRead,
        });

        newStream.on("data", (chunk: string) => {
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          lines.forEach((line) => {
            stream.push(`data: ${line}\n\n`);
          });
        });
      }
    });

    stream.on("close", () => {
      watcher.close();
      initialStream.destroy();
    });
  });

  // Send the stream as the response
  return new Response(stream as unknown as BodyInit, {
    headers: responseHeaders,
  });
}
