# Next steps for Antigravity

1. Read the implementation prompt, current progress files, architecture decisions and relevant planning specs. Inspect actual filesystem/Git state; the app has not been created by Codex.
2. Set up `app/` as the isolated Next.js TypeScript application, select compatible stable dependencies and record runtime/lockfile. Preserve original sources and assets.
3. Start a disposable Supabase-compatible development environment or identify the authorized staging project. Review the schema and implement versioned migrations, narrow RPC grants and Storage policies. Run real authenticated denied/success cases.
4. Build one complete registration/payment/pass vertical slice before broadening UI modules. Keep real payment collection gated until the official QR and policies are approved. Implement all other independent screens/workflows meanwhile.
5. Complete staff/scanner/judging/notification flows, test mobile and concurrency, stage on Vercel, and maintain the progress evidence. Report only genuinely missing live inputs when they block dependent work.

Current blockers apply to live integrations only: no verified cloud target/credentials, official payment QR, esports configuration, approved operational policies, named staff or sender configuration. They do not block local app development or source-based design work.

## 27 October — written esports update
Read ESPORTS_CLIENT_UPDATE.md first; implement forward database extensions and tests, then BGMI roster/declaration/referee flows. Resolve dependent policies before enabling registration/scoring. Obtain an audio transcript before incorporating spoken requirements.
