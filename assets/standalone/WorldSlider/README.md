# WorldSlider — project page

Standalone page, served at
`https://nus-core.github.io/assets/standalone/WorldSlider/`.

```
index.html                     # all page content; edit this
static/css/worldslider.css     # project-specific layout (grids, tabs, captions)
static/js/worldslider.js       # lazy video loading, play-when-visible, tab groups
static/css/*, static/js/*      # vendored Bulma / Nerfies template, do not edit
static/videos/                 # mp4 clips
static/images/                 # figures, poster frames, favicon
static/pdfs/                   # paper pdf
```

## Adding a video

Every clip is loaded lazily: put the path in `data-src`, not `src`. The helper in
`worldslider.js` attaches the source when the card nears the viewport, starts it
when it is on screen, and pauses it when it scrolls away.

```html
<figure class="ws-card">
  <div class="ws-panel-labels is-2"><span>Control</span><span class="is-ours">Generated</span></div>
  <video data-src="static/videos/gallery/world_01.mp4"
         poster="static/images/gallery/world_01.jpg"
         muted loop playsinline></video>
  <figcaption><strong>World 1.</strong> Caption text.</figcaption>
</figure>
```

Wrap cards in `<div class="ws-grid is-2">` (`is-1` … `is-4` columns; it collapses
to fewer columns on narrow screens). `ws-panel-labels is-N` writes labels above an
N-panel strip video, aligned to the panels.

## Tab groups

```html
<div class="ws-tabs" data-tabs="gallery">
  <button class="ws-tab is-active" data-panel="a">Group A</button>
  <button class="ws-tab" data-panel="b">Group B</button>
</div>
<div class="ws-panel" data-tabs="gallery" data-panel="a">…</div>
<div class="ws-panel" data-tabs="gallery" data-panel="b" hidden>…</div>
```

## Encoding clips for the web

The page lives in a git repo served by GitHub Pages, so keep each clip small
(target < 5 MB; anything much larger belongs on an external host). Re-encode the
high-quality masters before committing:

```bash
ffmpeg -i in.mp4 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
       -movflags +faststart -an out.mp4
```

`-movflags +faststart` matters — without it the browser must download the whole
file before the first frame appears. Poster frames keep the layout from jumping:

```bash
ffmpeg -i out.mp4 -vf "select=eq(n\,0)" -vframes 1 -q:v 3 poster.jpg
```

## Local preview

```bash
python3 -m http.server 8000    # then open http://localhost:8000/
```

`.nojekyll` is present so GitHub Pages serves the directory as-is.
