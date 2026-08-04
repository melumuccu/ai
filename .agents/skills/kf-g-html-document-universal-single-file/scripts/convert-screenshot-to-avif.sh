#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: scripts/convert-screenshot-to-avif.sh INPUT_PNG OUTPUT_AVIF" >&2
}

if [[ $# -ne 2 ]]; then
  usage
  exit 1
fi

input="$1"
output="$2"

if [[ ! -f "$input" ]]; then
  echo "error: input file not found: $input" >&2
  exit 1
fi

case "$input" in
  *.png|*.PNG) ;;
  *)
    echo "error: input must be a PNG file (.png): $input" >&2
    exit 1
    ;;
esac

case "$output" in
  *.avif|*.AVIF) ;;
  *)
    echo "error: output must be an AVIF file (.avif): $output" >&2
    exit 1
    ;;
esac

if [[ -e "$output" ]]; then
  echo "error: output already exists (refusing to overwrite): $output" >&2
  exit 1
fi

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg is not installed. Install ffmpeg with libaom support and retry." >&2
  exit 1
fi

if ! ffmpeg -hide_banner -encoders 2>/dev/null | grep -q 'libaom-av1'; then
  echo "error: ffmpeg libaom-av1 encoder is not available. Install ffmpeg with libaom and retry." >&2
  exit 1
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "error: ffprobe is not installed. Install ffmpeg (includes ffprobe) and retry." >&2
  exit 1
fi

if ! command -v file >/dev/null 2>&1; then
  echo "error: file command is not installed." >&2
  exit 1
fi

input_width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$input")"
input_height="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$input")"

if [[ -z "$input_width" || -z "$input_height" ]]; then
  echo "error: could not read input dimensions: $input" >&2
  exit 1
fi

ffmpeg -y -i "$input" -frames:v 1 -c:v libaom-av1 -still-picture 1 -crf 18 -b:v 0 "$output"

output_codec="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$output")"
output_width="$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$output")"
output_height="$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$output")"

if [[ "$output_codec" != "av1" ]]; then
  echo "error: output codec is not av1 (got: $output_codec)" >&2
  rm -f "$output"
  exit 1
fi

if [[ "$output_width" != "$input_width" || "$output_height" != "$input_height" ]]; then
  echo "error: output dimensions ($output_width x $output_height) differ from input ($input_width x $input_height)" >&2
  rm -f "$output"
  exit 1
fi

file_type="$(file -b "$output")"
if [[ "$file_type" != *"AVIF"* && "$file_type" != *"avif"* ]]; then
  echo "error: output is not AVIF according to file(1): $file_type" >&2
  rm -f "$output"
  exit 1
fi

echo "converted: $input -> $output (${output_width}x${output_height}, codec=av1)"
