# Fire and Flames project instructions

Read `handoff/README.md`, `handoff/ANTIGRAVITY_PROMPT.md` and the existing `planning` specifications before development. Preserve original PDF/DOCX and approved assets. Supabase and Vercel are selected; the implementation app belongs in `app/` unless the user later chooses otherwise.

At each session start, inspect the actual files/Git state and read `handoff/progress/STATE.json`, `IMPLEMENTATION_STATUS.md`, `NEXT_STEPS.md` and `CODEX_HANDOFF.md`. Do not infer that a previous agent's claimed completion is verified; consult test evidence and the implementation.

After each coherent milestone and before stopping, update progress state, changed files/reasons, tests actually run, migrations actually applied, deployment status and remaining work. Use the tracking protocol in `handoff/TRACKING_PROTOCOL.md`. Preserve earlier log entries and append corrections rather than rewriting history. Never put secrets or real participant/payment data in logs.

No fake login, demo-role switch, browser-only operational storage, guessed esports fee, invented official QR or screenshot-based automatic payment approval. Do not weaken RLS, role checks or tests to make the UI appear functional. Treat schema design, applied schema, implemented RPCs and verified workflows as different completion states.

Honor existing user authorization and platform approval requirements. Do not modify Crossfire's production resources or deploy to an unverified target. Continue independent local work when a specific external integration is unavailable, and record its exact blocker.
