# Fire and Flames planning pack

Prepared 27 October 2026 for Srusti Academy of Management & Technology (Autonomous). Event dates in the rules: 13–14 November 2026, Asia/Kolkata.

This is the predevelopment specification and asset handoff. No website, live authentication, payment collection or production database has been deployed. The PDFs are for college review; Markdown documents are the editable source for implementation.

## Start here

- Latest technical and esports amendments: `../handoff/README.md` and `../handoff/ESPORTS_CLIENT_UPDATE.md`. The review PDFs remain v1 and must be read with these amendments.
- `deliverables/Fire-and-Flames-Master-Plan.pdf` — complete specification, operations plan and release criteria.
- `deliverables/Fire-and-Flames-Design-Boards.pdf` — desktop, mobile, payment, volunteer and management screen concepts.
- `docs/01-product-and-scope.md` — outcomes, requirements and delivery boundaries.
- `docs/02-event-catalogue.md` — source facts, fees, prizes and rubrics.
- `docs/03-roles-and-access.md` — student, teacher, volunteer, judge, admin and super-admin permissions.
- `docs/04-registration-payments-and-qr.md` — state transitions, reconciliation, passes and scanning.
- `docs/05-experience-and-brand.md` — two-track landing, screen inventory and responsive design.
- `docs/06-architecture-and-data.md` — proposed architecture, entity model and API contracts.
- `docs/07-security-and-privacy.md` — threat controls, recovery and data handling.
- `docs/08-notifications.md` — delivery events, templates, retries and escalation.
- `docs/09-event-operations.md` — proposed two-day programme, staffing and runbooks.
- `docs/10-testing-and-delivery.md` — acceptance tests, phased plan and release checklist.
- `docs/11-decisions-and-source-register.md` — unresolved questions, risk owners and references.
- `assets/ASSET_GUIDE.md` and `assets/manifest.json` — source provenance and intended use.
- `data/event-catalogue.json` and `data/acceptance-tests.csv` — structured handoff data, not production seed migrations.
- `data/rubric-catalogue.json` — five source scoring rubrics; conditional scoring still needs approval.
- `docs/architecture.mmd` and `docs/registration-flow.mmd` — editable architecture and workflow diagrams.

## Confirmed decisions
Participation is open to other colleges. E-Fest is organized by ED Cell; esports by Srustiprosar (organizer attribution supplied by the user). Public event browsing and student/teacher sign-in must be mobile friendly. The brochure's black, gold, orange and red direction takes precedence over Crossfire's colors.

## Development gates
The official payment QR and verified beneficiary are not supplied. Do not invent a payment QR or activate collection. Esports entry fees and rules are absent. Individual registration team-allocation policy, timetable, exhibition award labels, refund policy, staff roster and sender setup need college decisions. The plan proposes defaults and identifies them as proposals, never as approved facts.

Crossfire reference reviewed read-only at `C:/CrossFire`: README.md, src/pages/LandingPage.tsx, src/index.css and package.json. No Crossfire credentials, participant data or production configuration were accessed or copied.

## Folder ownership
Original PDF and DOCX stay in the parent folder unchanged. `assets/source-embedded` holds exact unique image extractions, `source-pages` holds faithful cover renders, `brand` holds named copies, `web` holds responsive exports, and `generated` holds new supporting artwork. `tools` contains reproducible document and extraction scripts. `qa` contains internal renders and validation evidence.
