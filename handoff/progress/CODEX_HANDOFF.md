# Return handoff for Codex

## Current truth
Codex prepared the original planning pack and this Supabase/Vercel technical handoff on 27 October 2026. Antigravity has not yet implemented application code. No cloud project was linked, no migration applied remotely and no deployment created.

## Completed and verified
The schema foundation defines 57 tables and 130 foreign keys. It was applied to a disposable PGlite database and passed 29 structural/denial checks; see database/verification.json and TEST_EVIDENCE.md. The dictionary and ERD were generated from that actual schema. Planning documents, source assets and design boards remain in planning/.

## Not yet implemented
Next.js app, managed-auth integration, staff MFA, public/read projection RPCs, business commands, Storage policies, registration/payment/QR workflows, admin screens, judging, notifications, live acceptance tests and Vercel deployment.

## Important decisions
Use Supabase + Vercel; new Next.js app in app/. Separate competition entry from payable registration. Approved solo intake allocates before payment. QR lookup hash is accompanied by an encrypted envelope for redisplay using server-only encryption keys. No broad table grants. Two-person beneficiary changes use proposer plus distinct approver. Details: handoff/DECISIONS.md.

## Resume procedure
Read STATE.json, IMPLEMENTATION_STATUS.md, CHANGELOG.md, FILES_CHANGED.md, TEST_EVIDENCE.md, MIGRATIONS.md and DEPLOYMENTS.md. Inspect current code/Git diff and actual applied migrations before trusting this summary. Follow NEXT_STEPS.md. Original documents control event facts; latest user instructions control scope.

## Required Antigravity update before returning to Codex
Replace the current-truth sections with actual implementation progress while preserving history in CHANGELOG.md. Name completed/verified modules, incomplete work, changed files/ADRs, test failures or unrun checks, real deployment/migration state, blockers and the next five concrete actions. Include exact evidence paths and any still-running processes. Never include secrets or personal/payment records.

## 27 October — written esports update
Latest written BGMI facts are in ESPORTS_CLIENT_UPDATE.md and the updated catalogue. Read this addendum over old unknown-detail statements and v1 PDFs. No app work was done; 57-table schema remains baseline only. Audio contents unverified. New extension requirements must receive separate migration and test evidence.
