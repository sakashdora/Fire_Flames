# Antigravity development handoff

Prepared 27 October 2026. This handoff refines the earlier plan into a linked database design and an implementation contract. The user has selected Supabase and Vercel. No cloud database or deployment has been created by this handoff.

`../Fire-and-Flames-Antigravity-Handoff.zip` is the portable bundle: original PDF/DOCX, source notes, planning documents/design boards/assets, project instructions and this technical handoff. Internal planning QA renders are excluded. Open the existing workspace directly, or extract the bundle into a new folder. `package_handoff.py` rebuilds and checks the archive.

## Read in this order

0. `ESPORTS_CLIENT_UPDATE.md` — latest BGMI/LAN facts, chart transcription, unresolved conflicts and database delta. Audio contents remain unverified.
1. `ANTIGRAVITY_PROMPT.md` — the full instruction to paste or reference in Antigravity.
2. `ARCHITECTURE.md` — selected stack, service boundaries and deployment topology.
3. `database/README.md` and `database/001_schema_design.sql` — relational foundation and its limitations.
4. `database/ERD.md` and `database/DATA_DICTIONARY.md` — generated relationships and column definitions.
5. `database/COMMAND_CONTRACTS.md` — transactions and privileged commands Antigravity must implement.
6. `database/ACCESS_AND_STORAGE.md` — exact permission and file-storage boundary.
7. `SUPABASE_VERCEL_SETUP.md` — environments, secrets by name and deployment gates.
8. `progress/STATE.json`, `progress/IMPLEMENTATION_STATUS.md` and `progress/NEXT_STEPS.md` — current truth and resumable work.
9. The existing `../planning/README.md`, all eleven planning specifications and design boards.

The SQL is a schema foundation with database constraints and default-deny RLS. It is deliberately not a complete application migration bundle: authenticated business RPCs, storage policies and application code must be implemented and tested before launch. Do not apply it blindly to an existing Supabase database. Local test evidence is in `database/verification.json`; it does not prove Supabase Auth, live banking, email, Vercel or concurrent production behavior.

## Source priority
Latest user instructions and approved decisions take precedence. This handoff controls the refined database/architecture. Original PDF/DOCX control established event facts; `planning` controls product requirements and visual direction. Any conflict must be recorded, not silently resolved. The original master PDF remains the v1 review document; this handoff is its technical addendum, not a claim that those PDFs were regenerated.

## Resume with Codex later
Open this same folder and ask Codex to read `handoff/progress/CODEX_HANDOFF.md`, `STATE.json`, `CHANGELOG.md`, `TEST_EVIDENCE.md`, `DEPLOYMENTS.md`, the current Git diff, and applied migrations before continuing. Antigravity must update these files after every coherent milestone and before stopping. The files must distinguish implemented, verified, blocked and not started work.
