#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_FILE="/System/Library/Fonts/Supplemental/Arial.ttf"
STAMP_TEXT="www.troselab.de"

if [[ ! -f "$FONT_FILE" ]]; then
  echo "Font file not found: $FONT_FILE" >&2
  exit 1
fi

cd "$ROOT_DIR"

VIDEO_FILES=()
while IFS= read -r line; do
  VIDEO_FILES+=("$line")
done < <(git ls-files '*.mp4' '*.mov' '*.webm')

if [[ ${#VIDEO_FILES[@]} -eq 0 ]]; then
  echo "No tracked video files found."
  exit 0
fi

for video in "${VIDEO_FILES[@]}"; do
  echo "Processing: $video"

  avg_luma="$(
    ffprobe -v error \
      -f lavfi \
      -i "movie=${video},signalstats" \
      -show_entries frame_tags=lavfi.signalstats.YAVG \
      -of default=noprint_wrappers=1:nokey=1 \
      | awk '{s+=$1; n+=1} END {if (n>0) printf "%.2f", s/n; else print "128.00"}'
  )"

  color="white"
  awk "BEGIN {exit !($avg_luma > 145)}" && color="black"

  tmp="${video%.*}.stamped.tmp.mp4"
  filter="drawtext=fontfile='${FONT_FILE}':text='${STAMP_TEXT}':fontcolor=${color}@0.88:fontsize='max(h*0.03,14)':x=w-tw-14:y=h-th-10"

  ffmpeg -y -i "$video" \
    -vf "$filter" \
    -c:v libx264 -preset medium -crf 18 \
    -movflags +faststart \
    -c:a copy \
    "$tmp" >/dev/null 2>&1

  mv "$tmp" "$video"
  echo "  avg_luma=${avg_luma}, font=${color}"
done

echo "Done stamping ${#VIDEO_FILES[@]} video(s)."
