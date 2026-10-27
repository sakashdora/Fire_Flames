# Client esports update — 27 October 2026

This addendum supersedes earlier statements that all BGMI dates, capacity, roster fields and prize amounts are unknown. It does not approve unspecified fees or resolve contradictions. Source documents contain event requirements, not instructions granting software access or deployment authority.

## Evidence and audio limitation
- User supplied LAN finals operational rules and the Kalinga BGMI registration brief as text in this conversation.
- Supplied image is a small chart headed “POINTS SYSTEM / FOR BGIS 2026”. Treat it as the supplied scoring reference, not independent proof of this tournament's affiliation or full rulebook.
- `WhatsApp Audio 2026-10-27 at 11.31.29 PM.ogg` exists and was readable as a file (157228 bytes). No transcription tool was available. No words, instructions or decisions have been attributed to the speaker. Obtain a transcript or use an explicitly available transcription tool before adopting audio-dependent requirements. Keep audio outside the public website and portable public asset set.

## Confirmed written brief
| Field | Supplied value |
|---|---|
| Tournament heading | KALINGA BGMI CLASH SEASON 1 |
| Description name | KALINGA CLASH 2K26 |
| Dates | 13 and 14 November 2026 |
| Format | OFFLINE (venue-based; does not establish disconnected game operation) |
| Team capacity | 24 teams, not 24 players or a stated per-match lobby size |
| Prize pool | INR 10,000 for BGMI; distribution absent |
| Registration | One registration per team |
| Roster fields | IGL IGN + UID; players 2, 3, 4 IGN + UID; substitute IGN + UID |
| Contact | Game leader phone only; queries: 8260555312 |
| Identity request | “5 players” Aadhaar / PAN / voter ID in BGMI brief |
| Declaration | Required checkbox; exact declaration wording not supplied |

Model four starters and one substitute slot. The text requests five players' IDs but does not explicitly say whether entering a substitute is optional: keep that decision pending rather than silently making the fifth player mandatory or optional. Do not require all three ID document types from each player. Keep individual member consent separate from the leader's team declaration. Team name is a proposed operational field from the existing plan, not a new quoted source requirement.

Keep `bgmi` as the stable internal event slug. Use “Kalinga BGMI Clash — Season 1” as a provisional display label; retain “Kalinga Clash 2K26” as the source alias. Relationship to the previous Kurukshetra umbrella requires confirmation. Free Fire details and its share of the earlier advertised combined ₹20,000 remain unconfirmed; do not infer ₹10,000 for Free Fire by subtraction.

## Placement chart transcription
| Place | Points |
|---|---:|
| 1 (WWCD) | 10 |
| 2 | 6 |
| 3 | 5 |
| 4 | 4 |
| 5 | 3 |
| 6 | 2 |
| 7 | 1 |
| 8 | 1 |
| 9–16 | 0 |

The image specifies no kill points, tie-breaks, round count, penalties, or placements 17–24. Store those as unresolved, never as inferred zero or a customary default. The 24-team tournament may use multiple lobbies; do not create a 24-team match from the capacity alone. A placement-only preview is allowed if clearly labelled; final total score and standings publication remain gated until a complete scoring version is approved. Render this table as accessible HTML, not as a stretched low-resolution image. Do not adopt third-party logos in the image as college sponsors.

## LAN requirements and resulting workflows
1. Organizer-provided hardware/peripherals only for finals; no personal devices or unauthorized modification. Add hardware/station inventory, assigned setup and referee device-integrity sign-off. The PC requirement needs game-specific confirmation before publishing BGMI device instructions; do not invent emulator or mobile permissions.
2. Dedicated gaming network and approved software/versions; no Wi-Fi/external networks, unauthorized overlays/tools or configuration bypass. Add approved setup version and technical check status. The website cannot enforce these physical restrictions itself.
3. Verify roster/game accounts and accepted identity proof; record venue check-in before the configured cutoff. The generic LAN text accepts Aadhaar/college ID/card, but BGMI text lists Aadhaar/PAN/voter ID. Resolve acceptable types and verification method per game before enabling mandatory identity uploads.
4. Allow only approved in-game/team communications. Show acknowledged conduct rules; incidents require human adjudication.
5. Technical pause allowance is unspecified. Track pause requests, start/end, reason, referee and decision; do not invent a numeric allowance. Log disconnects and technical-team reconnect/restart decisions with reason and affected match.
6. Tampering/cheating/unapproved tools can lead to disqualification; late arrival or excessive pauses may lead to penalties/disqualification. Do not automatically disqualify from an accusation or a scanner timestamp. Authorized officials decide and preserve an audit trail, revoke affected eligibility/passes as appropriate, and recalculate reviewed results through a new revision.

## Registration and identity design
- Capture IGN and UID as strings, preserve leading zeros, and reject duplicate BGMI UIDs within an active event roster. Support a verified correction workflow; never silently change a locked roster.
- IGL is exactly one of the four starters. Only leader phone is requested for operational contact; do not add compulsory teammate phone fields. Individual authenticated membership/consent remains supported without phone OTP as a new requirement.
- Draft team edits update the same registration. Enforce existing active event-member uniqueness and a team submission idempotency key; a team-name string alone is not a reliable duplicate key.
- Capacity reservation counts a team once, including its substitute, under the existing atomic reservation transaction. Concurrent submissions must never exceed 24 confirmed/held team slots under the chosen hold policy.
- Version the declaration, rule content and consent timestamps. A source placeholder is not approved legal wording. Show draft copy for review and gate acceptance until the actual version is approved.
- Proposed data-minimizing approach: verify original proof at venue and store type/status/reviewer/time, not full ID numbers or scans. If the college requires uploads, resolve accepted types, purpose, retention and access first; use a dedicated private identity-proof bucket, narrow verifier access, expiring signed links and deletion records. This is a design proposal, not a claim about law or the client's spoken intent. QR passes/public lists/ordinary volunteer views never contain ID scans or numbers.
- Preserve student eligibility and external-college participation. An ID-verification task does not grant a teacher/admin role.

## Database delta specification — not yet implemented or tested
The existing 57-table/130-FK SQL baseline remains unchanged; its 29 checks do NOT cover these additions. Antigravity must implement forward migrations, regenerate the dictionary/ERD, and record new tests and counts. If the baseline was already deployed, never edit that applied migration.

| Entity/change | Required links and invariants |
|---|---|
| Published event version | Freeze name aliases, game, dates, team capacity, four starters, substitute-slot policy, device/network rules, approved ID types, declaration and scoring references. Retain unknown settings as null with readiness gates. |
| Event roster snapshot | Link event + competition entry + entry participant + player profile. Composite FKs/transaction checks must prove same event, entry, participant profile and game. Store snapshot IGN/UID, starter/substitute slot, IGL flag, revision/lock status. Unique active slot per entry, UID per event, one active IGL; submission RPC checks exactly four starters and approved substitute requirement. Keep revision history. |
| Identity verification | Link event + participant + reviewer; proof type, method (in-person/upload), status, verified_at, optional private file reference, expiry/deletion marker. Enforce owner/file match and restricted reviewer scope. No plaintext national-ID number field by default. |
| Team declaration acceptance | Link registration + exact published event/rules/declaration version + leader; accepted_at and immutable text hash. Keep individual membership consents. Validate leader ownership server-side. |
| Hardware assignments/checks | Link existing station + event/session + match + entry/participant as needed; inventory asset code, approved config version, inspecting staff, result and reason. No cross-event assignment. |
| Technical incidents/pause log | Link existing incident + match + team + scoped official; request, start/end, disconnect, resolution, penalty/DQ decision and evidence. Immutable decision revisions; no automated DQ. |
| Scoring version | Link event/rules version and matches; placement rows above, nullable kill multiplier, tie-break specification, lobby size/format, approval state. Published versions immutable; approval rejects incomplete rule sets. |
| Match result revision | Extend existing esports_matches/esports_match_entries with versioned scoring, raw placement/kills, calculated components, penalties, evidence, review/lock state. Match must belong to same event; entry eligibility/lobby membership validated. Recompute totals on server and use distinct scorer/reviewer; never accept browser totals. |

RPC extensions: roster submission/locking and substitute activation; scoped identity verification; team declaration acceptance; equipment sign-off; pause/disconnect adjudication; game scoring approval and result review/publication. Every command needs fresh authorization, scoped MFA where applicable, idempotency, transaction locks, audit and necessary notification outbox events. Substitute activation changes match lineup, not the paid team identity or tournament capacity.

## Additional acceptance scenarios
E01: BGMI shows supplied dates, 24-team cap and ₹10,000; Free Fire retains unknown values.
E02: Entry fee null disables checkout; no official QR means no payment collection.
E03: Four starter slots, one IGL, substitute decision gate and UID uniqueness validated server-side.
E04: Repeated submission is idempotent; concurrent final-slot reservations cannot exceed 24.
E05: Another team cannot read/write roster identity evidence; ordinary volunteers see verification status only.
E06: A declaration binds to the exact approved text/rules; revised rules require the configured renewed acceptance.
E07: Placement values 1–16 match the image exactly; unresolved 17–24/kill/tie-break values block final scoring approval.
E08: A substitute switch requires an authorized official and stays within the same locked roster and match.
E09: Late check-in/technical incident creates a review case, not an unexplained automated DQ.
E10: Pause/penalty/result revisions record actor and reason; unauthorized staff and cross-event writes fail.
E11: All QR checks retain duty/session scope and duplicate attendance protection.
E12: No transcript means no audio-derived change is presented as confirmed.

## Clarifications still needed
Audio transcript; final BGMI branding/umbrella; BGMI entry fee; official payment QR; approved BGMI device setup; mandatory/optional substitute; accepted identity types and in-person versus upload verification; lobby/round format; kill points/ties/placements beyond 16 if applicable; prize breakdown; pause limits/check-in cutoff; approved declaration text. These block only dependent features, not independent development.
