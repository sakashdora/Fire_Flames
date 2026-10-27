# Technical decisions and precedence

## ADR 001 Hosting and application structure
Supabase and Vercel are confirmed by the user. Use a new Next.js App Router TypeScript application for public rendering and server handlers. This refines the earlier generic React proposal. Preserve the original design and all event facts; no current app is being migrated. Versions must be selected and locked during implementation, not guessed in this document.

## ADR 002 One event entry can have multiple payable registrations
Separate competition_entries from registrations. A ₹99 team registration pays once for its accepted members. If approved, several ₹59 individual registrations can form one entry with separate payment histories. Allocate consenting individuals before taking payment, then reserve one entry capacity unit. This narrows the earlier draft's paid-before-allocation possibility to avoid unfulfillable paid intake. Individual checkout stays disabled pending college approval.

## ADR 003 Private tables and explicit commands
All domain tables are in unexposed app schema with RLS enabled and direct client grants revoked. Expose only reviewed public read/RPC projections. This is a default-deny foundation, not a complete working permission system. Antigravity must implement the command layer before any UI claims a successful write.

## ADR 004 QR redisplay and encryption
Store a random token's hash for lookup and an AES-256-GCM envelope for authenticated redisplay; never store plaintext tokens. Encryption key stays server-only in Vercel with versioning and environment separation. This extends the v1 plan's hash-only concept, which cannot by itself redisplay a token after a new login. Implement cryptographic and authorization tests; database fixture tests do not validate encryption.

## ADR 005 Two-person beneficiary change
Use a checked proposal by one named super admin and independent approval by another. The approver cannot be the proposer. This is a two-person process, not an accidental requirement for three staff. No active profile edit in place; new version plus audit and notification.

## ADR 006 Scope of this handoff
Delivered: linked schema design, database dictionary and diagrams, command/access contracts, provider setup plan, implementation prompt and continuity records. Not delivered: website, complete RPC implementations, Supabase project, live Storage/auth tests, email sender, bank integration, Vercel deployment or completed application tests. Local verification covers structural database behavior only.

## Changes during implementation
Append a dated ADR whenever Antigravity changes data relationships, permissions, fee handling, technology, security or agreed UI behavior. Include old behavior, new behavior, reason, migration impact, affected tests and any college decision required. Routine bug fixes should be logged but do not need a fresh user approval unless the action itself requires it.
