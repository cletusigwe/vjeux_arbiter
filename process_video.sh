#!/bin/bash

# Script to help process videos with a specific video ID for output
set -e

# Function to process video from a file
process_file() {
  local filename="$1"
  local video_id="$2"
  echo "Processing video  $filename into suitable format for Twitter and Threads using FFmpeg"
  ffmpeg -loglevel error -i "$filename" -c:v libx264 -crf 20 -vf format=yuv420p -c:a aac "processed_videos/${video_id}.mp4"
  echo "Processed video saved as: ${video_id}.mp4"
}

# Function to process video from a URL
process_url() {
  local url="$1"
  local video_id="$2"
  echo "Downloading video from URL: $url"
  yt-dlp -q --no-warnings -o "downloaded_videos/${video_id}.%(ext)s" "$url"
  local downloaded_file=$(yt-dlp --no-warnings --get-filename -o "downloaded_videos/${video_id}.%(ext)s" "$url")
  echo "Downloaded video as: $downloaded_file"
  echo "Processing video $downloaded_file into suitable format for Twitter and Threads using FFmpeg"
  ffmpeg -loglevel error -i "$downloaded_file" -c:v libx264 -crf 20 -vf format=yuv420p -c:a aac "processed_videos/${video_id}.mp4"
  echo "Processed video saved as: ${video_id}.mp4"
}

# Check if at least the URL or file and output video ID is provided
if [ "$#" -eq 0 ]; then
  echo "Usage: $0 -f <filename> -o <video_id> | -u <url> -o <video_id>"
  exit 1
fi

# Initialize variables for options
file_input=""
url_input=""
video_id=""

# Parse command-line options
while getopts ":f:u:o:" opt; do
  case $opt in
    f)
      file_input="$OPTARG"
      ;;
    u)
      url_input="$OPTARG"
      ;;
    o)
      video_id="$OPTARG"
      ;;
    *)
      echo "Invalid option: -$OPTARG"
      echo "Usage: $0 -f <filename> -o <video_id> | -u <url> -o <video_id>"
      exit 1
      ;;
  esac
done

# Ensure video ID is provided
if [ -z "$video_id" ]; then
  echo "Error: Output video ID is required."
  exit 1
fi

# Process file or URL based on the input
if [ -n "$file_input" ]; then
  process_file "$file_input" "$video_id"
elif [ -n "$url_input" ]; then
  process_url "$url_input" "$video_id"
else
  echo "Error: Either a file or URL must be provided."
  exit 1
fi
