#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${APP_DIR}/../.." && pwd)"

SOURCE="${1:-${REPO_ROOT}/hero_transitioning_clothes.mp4}"
OUTPUT_DIR="${APP_DIR}/public/home/hero-sequence"
DESKTOP_DIR="${OUTPUT_DIR}/desktop"
MOBILE_DIR="${OUTPUT_DIR}/mobile"

if [[ ! -f "${SOURCE}" ]]; then
  printf 'Source video not found: %s\n' "${SOURCE}" >&2
  exit 1
fi

mkdir -p "${DESKTOP_DIR}" "${MOBILE_DIR}"
rm -f "${DESKTOP_DIR}"/frame-*.webp "${MOBILE_DIR}"/frame-*.webp

# The source is landscape. Desktop keeps the full frame; mobile creates a
# centered portrait crop so phones do not download the desktop sequence.
ffmpeg -hide_banner -loglevel error -y \
  -i "${SOURCE}" \
  -vf "scale=1920:-2:flags=lanczos" \
  -fps_mode passthrough \
  -c:v libwebp -preset picture -quality 95 -compression_level 6 \
  "${DESKTOP_DIR}/frame-%04d.webp"

ffmpeg -hide_banner -loglevel error -y \
  -i "${SOURCE}" \
  -vf "scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,crop=720:1280" \
  -fps_mode passthrough \
  -c:v libwebp -preset picture -quality 82 -compression_level 5 \
  "${MOBILE_DIR}/frame-%04d.webp"

ffmpeg -hide_banner -loglevel error -y \
  -i "${SOURCE}" \
  -frames:v 1 \
  -vf "scale=1920:-2:flags=lanczos" \
  -c:v libwebp -preset picture -quality 95 -compression_level 6 \
  "${OUTPUT_DIR}/poster-desktop.webp"

ffmpeg -hide_banner -loglevel error -y \
  -i "${SOURCE}" \
  -frames:v 1 \
  -vf "scale=720:1280:force_original_aspect_ratio=increase:flags=lanczos,crop=720:1280" \
  -c:v libwebp -preset picture -quality 82 -compression_level 5 \
  "${OUTPUT_DIR}/poster-mobile.webp"

desktop_frames=("${DESKTOP_DIR}"/frame-*.webp)
mobile_frames=("${MOBILE_DIR}"/frame-*.webp)

printf 'Desktop frames: %s\n' "${#desktop_frames[@]}"
printf 'Mobile frames: %s\n' "${#mobile_frames[@]}"
