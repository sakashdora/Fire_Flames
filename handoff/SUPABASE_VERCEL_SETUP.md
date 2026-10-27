# Supabase and Vercel deployment guide

The user has selected these providers. Project-specific links are unknown until real projects are linked; do not invent project IDs, URLs or a successful deployment.

## Official starting links
- Supabase projects: https://supabase.com/dashboard/projects
- Supabase CLI migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase SSR: https://supabase.com/docs/guides/auth/server-side
- Supabase storage access: https://supabase.com/docs/guides/storage/security/access-control
- Vercel dashboard: https://vercel.com/dashboard
- Vercel Next.js deployment: https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables

## Deployment topology
| Environment | Web | Database and storage | Email |
|---|---|---|---|
| Local | Local Next.js server | Supabase local stack or designated disposable dev project | Test provider/sink |
| Preview and staging | Vercel preview or protected staging project | Separate staging Supabase project | Approved test recipients only |
| Production | College-owned Vercel project and approved domain | Separate production Supabase project | Verified college sender |

Keep Supabase and Vercel regions near the intended users where supported. Record chosen region, service plan, backup capability, quotas and project owner. A Vercel preview must never silently use production database credentials. Ensure auth callback allowlists match exact approved origins, avoid broad wildcards, and use validated same-origin return paths.

## Environment variables by name only
| Name | Visibility | Purpose |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Public configuration | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public configuration | Current supported publishable key; legacy anon name only if chosen SDK requires |
| SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY | Server only | Narrow staff-provisioning, pass-issuance and worker operations; choose the supported key form and document it |
| NEXT_PUBLIC_SITE_URL | Public configuration | Canonical approved site origin |
| PASS_TOKEN_ENCRYPTION_KEY_V1 | Server only | Random 32-byte AES key, encoded as documented; never commit |
| PASS_TOKEN_ACTIVE_KEY_VERSION | Server only | Current encryption key version |
| EMAIL_PROVIDER_API_KEY | Server only | Transactional sender |
| EMAIL_FROM_ADDRESS | Server configuration | Verified college sender |
| EMAIL_WEBHOOK_SIGNING_SECRET | Server only | Provider callback verification |
| CRON_SECRET | Server only | Scheduler-to-worker authentication |
| SUPABASE_DB_URL | Migration runner only | Approved database connection; never ship in frontend |

Write `.env.example` with empty/placeholding values and comments. Keep actual values in local ignored environment files and provider secret stores. Do not paste secrets into handoff logs, URLs, commits, screenshots or prompts. Log only whether a required variable is configured. Generate encryption/cron secrets securely, separately for each environment.

## Staging setup order
1. Inspect the folder and Git state, create the app if absent, choose compatible stable versions and record the lockfile/runtime.
2. Obtain the intended Supabase staging project or local runtime. Verify project ID/environment before migration; never infer it from an unrelated Crossfire file.
3. Review and copy the schema foundation into the first versioned migration. Implement command/RPC and grants migrations, Storage policy migrations and non-secret source-data seeds. Seed eight draft event records; keep unknown esports prices null and collection off. Never seed fake verified payments or staff passwords.
4. Configure Auth verification/reset/invite URLs and SMTP/provider. Implement verification, teacher request/invitation, staff MFA and a one-time authenticated owner-controlled bootstrap. Disable bootstrap after use and record its audit entry.
5. Configure private buckets and validate upload/download policies using real student, finance and volunteer identities.
6. Set Vercel preview/staging variables. Build and deploy a preview; record actual returned URL, commit SHA and status. Verify protected pages, API authorization and callbacks at that URL.
7. Run database integration, E2E, real-device camera, email, concurrency and restore tests. Record failures openly and fix without weakening protections.

## Production sequence
Confirm college-owned targets and existing user authorization for actual publication. If live target/authorization is absent, finish staging and request only the missing target or approval. Prepare backup/recovery evidence, apply reviewed migrations to the verified production project, seed approved content only, provision named staff, configure real sender and keys, then deploy the exact tested commit. Record database migration status and Vercel deployment separately. A queued build or returned URL is not proof all workflows work.

Keep payment collection off until the real college QR/beneficiary is checked and two-person approval recorded. Keep esports paid intake off until its rules and fees are approved. Run the user-authorized college test payment, independently reconcile it, verify pass delivery/scan and reconcile any refund. Do not charge a real person for a test without explicit authorization.

## Record actual linked resources
Fill `progress/DEPLOYMENTS.md` with environment, project owner, Supabase project reference/dashboard URL, Vercel project URL, deployed site URL, Git SHA, migration filenames, deployment status, verification and rollback link. No passwords or keys. Use returned platform values, never fabricated placeholders presented as actual links.

## Recovery
Application rollback points to a known Vercel commit/deployment. Database repair uses forward migrations or a tested restore; record any lost writes and reconciliation implications. Keep backups/keys under college control. Test failed email, interrupted worker, expired auth and role-revocation behavior before event day.
