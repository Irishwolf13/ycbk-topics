# ycbk-topics

Client-side accordion browser for 100 curated YCBK podcast topics, installed as a single Custom HTML block on a WordPress page.

## Files
- `ycbk-topics.js` — widget logic (vanilla JS, no build step)
- `ycbk-topics.css` — styles, all classes prefixed `.ycbk-topics__`
- `ycbk-topics-data.js` — hand-curated list of 100 topics and their episodes; exposes `window.YCBK_TOPICS`
- `test-harness.html` — open in a browser for local verification

## Data updates
Data is hand-curated. Edits go through a monthly review workflow — see the memory entry `feedback_topics_monthly_review.md`. After edits, tag a new version (e.g. `v1.1.0`) and update the version string in the WP page's HTML block.

## Deployment
See `docs/superpowers/specs/2026-04-24-topics-feature-design.md` §12 for the 8-step rollout.
