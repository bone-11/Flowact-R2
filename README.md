# FlowAct-R2 Clean Website

This export uses the original index.html layout, not either blog variant.
Only active HTML dependencies, CSS dependencies, and video posters are included.
Videos are copied byte-for-byte, without re-encoding.

## Run

Open a terminal in this extracted folder:

```sh
python3 serve.py --bind 127.0.0.1 --port 8123 --directory .
```

On Windows, use `python` instead of `python3` if needed.
Open http://127.0.0.1:8123/index.html in your browser.
If port 8123 is occupied, choose another port and use that port in the URL.

Use this included server or another HTTP server supporting Range (206 Partial
Content). Do not substitute a server without Range support: seeking may fail.
Keep the static/ directory structure intact.

## Contents and cleanup

- Includes the currently referenced videos, images, explicit/automatic posters,
  CSS, JavaScript, and fonts referenced by local CSS.
- Excludes unused videos, commented-out examples, blog variants, paper drafts,
  backups, debug logs, internal debug reporting, and Google Analytics.
- The source website was not modified. Missing favicon is replaced by the
  existing logo; missing Font Awesome 5.15.1 font dependencies are included.
- Google Fonts and the Academicons CDN stylesheet still require Internet.
  Research hyperlinks are intentionally retained as external links.
- MANIFEST.json records included files, sizes, SHA-256 hashes, and external URLs.

## Regression checklist

- Clicking a video loads it and enables audio.
- Starting another video pauses the first without resetting its position.
- Seeking works after metadata loads; HTTP Range requests return 206.
- Carousels, images, and all video posters still load.
- Add media only when it is referenced by the page, including default JPG posters.
