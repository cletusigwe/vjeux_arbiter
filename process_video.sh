#!/bin/bash

#script to help us process the videos
set -xe

#get the most important parts later, after calculating if video >10mb

# Function to process video from a file
process_file() {
  local filename="$1"
  echo "Processing video file: $filename"
  # ffmpeg -i "$filename" -c:v libx264 -crf 20 -vf format=yuv420p -c:a copy processed_videos/"$filename".mp4
}

# Function to process video from a URL
process_url() {
  local url="$1"
  echo "Downloading video from URL: $url"
  # yt-dlp -q --no-warnings -o downloaded_videos/"%(title)s.%(ext)s" "$url"
  # local filename=$(yt-dlp -q --no-warnings -o downloaded_videos/"%(title)s.%(ext)s" "$url" --get-filename)
  echo "Downloaded video as: $filename"
  echo "Processing video file: $filename"
  # ffmpeg -i "$filename" -c:v libx264 -crf 20 -vf format=yuv420p -c:a copy processed_videos/"$filename".mp4
}

# Check if at least one argument is provided
if [ "$#" -eq 0 ]; then
  echo "Usage: $0 -f <filename> | -u <url>"
  exit 1
fi

# Parse command-line options
while getopts ":f:u:" opt; do
  case $opt in
    f)
      process_file "$OPTARG"
      ;;
    u)
      process_url "$OPTARG"
      ;;
    *)
      echo "Invalid option: -$OPTARG"
      echo "Usage: $0 -f <filename> | -u <url>"
      exit 1
      ;;
  esac
done
