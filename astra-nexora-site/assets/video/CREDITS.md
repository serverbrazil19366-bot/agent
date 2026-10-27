# Video credits

| File | Source | Creator | Licence |
|------|--------|---------|---------|
| `hero.mp4` | [Team Meeting — Pexels 7147921](https://www.pexels.com/video/team-meeting-7147921/) | Tiger Lily (per the Pexels listing — confirm on the source page) | [Pexels License](https://www.pexels.com/license/) |

## Processing
- Source: 1920×1080 25fps, 15.6 s. Output: 1920×1080, 14.6 s, ~2.8 MB, no audio, H.264 CRF 27, `faststart`, saturation 0.95 (same grade as the photos).
- Seamless loop: the last second is crossfaded into the first second, so the jump at the loop point is hidden.
- The hero poster (`assets/stock/pexels-7147921-poster-*.webp`) is the first frame of `hero.mp4`, so the photo-to-video switch has no visible jump.

## Replacing the video
```bash
# 1. encode the new clip (D = its duration in seconds, E = D - 1)
ffmpeg -i new.mp4 -filter_complex "[0:v]split=3[a][b][c];[a]trim=1:E,setpts=PTS-STARTPTS[main];[b]trim=E:D,setpts=PTS-STARTPTS[tail];[c]trim=0:1,setpts=PTS-STARTPTS[head];[tail][head]xfade=transition=fade:duration=1:offset=0[x];[main][x]concat=n=2:v=1:a=0,scale=1920:-2,eq=saturation=0.95,format=yuv420p[v]" -map "[v]" -an -c:v libx264 -crf 27 -preset slow -movflags +faststart assets/video/hero.mp4
# 2. take its first frame as the new poster original
ffmpeg -i assets/video/hero.mp4 -frames:v 1 -q:v 2 scripts/originals/pexels-<ID>-poster.jpg
# 3. update scripts/images.json + the hero <img>/preload filenames, then
npm run images
```

## Services backdrop — `space.webm` / `space.mp4`

- Source: Pexels video 9341381, "A Starry Night Sky" — https://www.pexels.com/video/a-starry-night-sky-9341381/
- Licence: Pexels licence (free to use, no attribution required)
- Edit: scaled to 1920px, slowed to 0.625×, played forward then reversed so the loop has no jump (18.6 s); audio removed
- Poster: first frame, `space-poster-w800.webp` / `space-poster-w1920.webp`
