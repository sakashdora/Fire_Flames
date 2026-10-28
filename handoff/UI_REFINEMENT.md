# Public design and motion refinement — 28 October 2026

## Changed
Rebuilt homepage, E-Fest and esports pages with condensed festival typography, warm white/charcoal/ember palette, original source artwork, equal organizer entrances, event poster grid, campus section, clear fees and accessible rules. Replaced crowded shared header/footer; added mobile menu, Escape dismissal and focus return, active navigation and skip link. Removed implementation/compliance jargon and the false staging claim from public copy.

GSAP 3.15.0 handles staggered entrance, one-time scroll reveals, desktop-only image parallax and a scroll-linked closing line. Native scrolling is preserved; no loader, looping ticker or scroll lock. MatchMedia respects reduced motion; context cleanup removes animations/triggers on unmount. Hover feedback uses CSS. GSAP references: https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/ and https://gsap.com/docs/v3/Plugins/ScrollTrigger/.

Corrected the catalogue against planning/data/event-catalogue.json: unknown game capacities remain null; Bazar/Exhibition capacities are 10; Brand War 2–3, trivia/treasure 2–4; restored the six documented prize pools; removed invented venues/maps/specific daily schedules. Payments remain disabled pending official QR. Event links carry an allowlisted event slug into the registration preview.

## Findings about the previous implementation
The prior handoff's complete/verified claims exceed the evidence. Student login used a timer to claim an email was sent; teacher login set local state and claimed a token was dispatched. Both now report that sign-in is not connected and no email was sent. Registration still uses React state only; changed its labels to preview/not submitted instead of recorded/locked. These workflows require backend implementation, not just cloud credentials.

Several tests in src/tests/workflows.test.ts assert synthetic fixture properties rather than execute server endpoints or concurrent database calls. Passing those tests does not verify authentication/MFA, persisted registration, concurrency or end-to-end operation. Database migrations were not re-audited in this visual task. Staff workflows remain unreviewed here. No live deployment or database change was made.

## Verification scope
TypeScript noEmit passed after enabling allowImportingTsExtensions for existing native Node TypeScript test imports. 11 tests passed, including a new source-catalogue regression test. Browser checked the redesigned homepage and E-Fest at 390px, mobile menu/Escape and event navigation. Additional production checks are recorded in TEST_EVIDENCE.md. Reduced-motion behavior is implemented through media queries; OS-level reduced-motion emulation is not available in the current browser API.

Initial dev hot-reload produced transient stale-module errors while replacing layout files; subsequent page loads rendered correctly. Initial sandbox production build failed on Windows EPERM mkdir and was retried with permission. Do not interpret either as a passing production build until final evidence is recorded.

Package installation reported two existing dependency-tree advisories (one high, one critical). No forced framework upgrade was applied during this visual refinement; dependency review is a separate release prerequisite.

## Final result
Production build and desktop/mobile browser review passed after fixing the CSS import and isolating preview build output from concurrent development. See progress/TEST_EVIDENCE.md for exact scope and evidence. Screenshots are in qa/.

## Cinematic hero follow-up
Standalone FestivalHero replaces the former stacked headline/poster composition. Uses the already supplied ember background and organizer logos. Date ring is code-native SVG; no replacement institutional artwork was generated. Hero entrance and ambient GSAP animations are scoped separately from the existing section animations. Pause/resume, offscreen/background-tab suspension and reduced-motion support are included. Screenshot evidence: qa/hero-cinematic-desktop.png and qa/hero-cinematic-mobile.png.
