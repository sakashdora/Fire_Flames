# Next steps for Antigravity & Codex
 
## Next 5 Concrete Actions
1. **Link Staging Supabase Target**: Obtain authorized Supabase staging project credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. **Apply Remote Migrations**: Sequentially execute `001_schema_design.sql` followed by `002_esports_lan_extensions.sql` against the Supabase staging database and record the result in `MIGRATIONS.md`.
3. **Provision Storage Buckets & Policies**: Create private Supabase Storage buckets (`payment-evidence`, `official-payment-qr`, `entry-attachments`, `incident-evidence`, `private-exports`) with row-level security policies restricting access to verified staff roles.
4. **Ungate Live Payment & Final Scoring When Authorized**:
   - Upload verified college UPI QR code image and specify exact BGMI entry fee to enable live checkout.
   - Obtain formal tie-break rule and placements 17–24 scoring table to ungate final scoring publication.
5. **Deploy Staging to Vercel**: Configure environment variables in Vercel project, deploy `app/`, and execute end-to-end acceptance tests on mobile hardware (camera QR scanner, referee portal).

## External Blockers (Live Integration Only)
- Staging Supabase credentials and project target.
- Staging Vercel deployment token/project target.
- Official college payment QR asset & unconfirmed BGMI entry fee.
- Voice note audio transcript (spoken requirements remain unverified; no audio-derived requirements were invented).


## Codex refinement — 28 October 2026
Review the new public design. Before release, implement real student/teacher authentication and persisted registration; replace synthetic acceptance claims with actual endpoint/Auth/RLS/concurrency tests. Audit the remaining staff workflows and dependency advisories. Use verified cloud targets only. Visual task did not perform migrations or deployment.

## Cinematic hero — 28 October 2026
Review the cinematic hero in the local preview. Continue backend work from UI_REFINEMENT.md; preserve the isolated review build and do not overwrite concurrent changes.


## Claude Code — 28 October 2026 (IST): mockup hero, Supabase command layer, real workflows
1. Obtain a college-authorized Supabase project (Mumbai region). Then: supabase link --project-ref <ref>; supabase db push (applies 0100-0400). Record in MIGRATIONS.md.
2. Supabase Auth: Site URL = production origin; redirect URLs = <origin>/auth/callback for production and Vercel preview domains; enable TOTP MFA; configure an approved SMTP sender.
3. Vercel: import github.com/sakashdora/Fire_Flames, Root Directory app, set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SITE_URL, PASS_ENCRYPTION_KEY (openssl rand -hex 32, distinct per environment). Check /api/health returns database: reachable.
4. First organizer signs in, saves profile; run app.bootstrap_super_admin in the SQL editor; super admin enrolls TOTP at /mfa, then grants event admins/referees/volunteers/judges.
5. Live acceptance on staging: two real accounts for invitation binding, captain flow to place held, referee two-person result review, MFA denial, and a concurrent reservation race using multiple connections.
Not implemented yet: payments (blocked on official QR/beneficiary/storage), pass issuance and QR display, waitlist, notifications/outbox worker, storage policies and uploads, exports, results publication, rate limiting at the route boundary.
