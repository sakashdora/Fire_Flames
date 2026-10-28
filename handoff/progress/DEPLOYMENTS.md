# Deployment ledger

No Supabase or Vercel project has been linked and no application has been deployed in this task.

| Environment | Supabase project reference and dashboard link | Vercel project and deployed URL | Git SHA | Migration state | Platform status | Verified behavior |
|---|---|---|---|---|---|---|
| Local | Local PGlite fixture | Local Next.js 14 App (`app/`) | `14b44c8` | 001 + 002 verified in PGlite | Build & test passed | 10/10 tests pass, Next.js build clean (24 routes), 68 tables & 165 FKs verified |
| Staging | Not linked | Not linked | Not recorded | Not applied | Not deployed | NOT RUN (Blocked: Supabase/Vercel project credentials) |
| Production | Not linked | Not linked | Not recorded | Not applied | Not deployed | NOT RUN (Blocked: Live deployment sign-off & verified target) |

Record actual returned IDs/URLs after linking. Do not store secrets, database passwords or full connection strings here. A returned deployment URL is separate from a passing application smoke test.

## Codex refinement — 28 October 2026
No cloud deployment. Local preview only; final build/start evidence follows in TEST_EVIDENCE.md.

Final local review server: http://127.0.0.1:3100, NEXT_DIST_DIR=.next-preview, production build passed. This is not a Vercel deployment.

## Cinematic hero — 28 October 2026
Hero follow-up remains local only; no Vercel deployment.

Latest cinematic hero: local production preview session 22844 on port 3100. Build PASS; no public deployment.

## GitHub Remote Setup — 28 October 2026
- Remote origin: `https://github.com/sakashdora/Fire_Flames.git`
- Branch: `main`
- Pushed commit: `516ef1f` (`feat(ui): complete UI refinement, cinematic hero, unified portal sign-in, and DJ section removal`)
- Upstream: `origin/main` configured and synced



## Claude Code — 28 October 2026 (IST): mockup hero, Supabase command layer, real workflows
No Supabase project linked and no Vercel deployment performed. The Supabase CLI on this machine is signed in to an organization whose projects (Trade_Vault, crossfire, Elesene, SOCILA SPACE) are unrelated; none was modified. User chose to import the GitHub repo into Vercel themselves (Root Directory: app). Until NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set, the deployed site serves public pages and reports sign-in/workspaces as not configured; /api/health returns 503 degraded.
