# Asset library and usage

All 28 unique embedded images from ABOUT.pdf have been extracted without generative reconstruction. Repeated PDF images are deduplicated by SHA-256 and all source page references are retained in manifest.json. Nine complete illustrated pages have faithful PNG renders and 480/960 px WebP variants. These are reference/download art, not a substitute for semantic event-page text.

## Named artwork
The `brand` directory supplies named exact copies for ED Cell, Srustiprosar, esports, IPL Auction, e-Trivia, Treasure Hunt, Brand War, Srusti Bazar, Srusti Exhibition, Kurukshetra, campus photo and source textures. Preserve each original background and alpha channel. Treasure Hunt has its own black square background; do not pretend it is a transparent cutout. The main Fire & Flames wordmark is PDF text, not an embedded raster logo; `brand/fire-and-flames-wordmark-source.png` is a faithful regional PDF render with its original background retained, not a transparent reconstruction. Named source copies include visible bounds in the manifest to guide document or SVG framing without modifying the originals.

No official payment QR exists in the supplied files. There is intentionally no fabricated payment QR, participant QR or bank identifier in this asset library. Development will generate real participant QR codes from server-issued tokens only after the required confirmation state.

## New supporting artwork
`generated/ember-hero.png` is a new decorative landscape background created with the built-in image-generation tool. It is not an official logo or a reconstructed source asset. Its prompt is retained in `generated/PROMPT.md`. Responsive derivatives belong in `web`. Do not bake live fees, organizer names, dates or buttons into this artwork.

## Asset handling
Use source-embedded images as archival originals. Named brand files preserve original bytes and dimensions. WebP variants are export derivatives, with aspect ratio retained; source provenance remains in the manifest. Use small logos at appropriate intrinsic size, especially the 160×160 ED Cell mark. Avoid upscaling it into a large hero. Obtain official vector/high-resolution masters if required. College publication approval should include rights/brand confirmation for supplied and game-related artwork.

## Design boards
The static PDF boards show layout intent and key operational states. They are composed from the source artwork, live document text and simple graphic shapes. QR boxes are labelled as unavailable/specification-only. Sample registration names, IDs and dashboard counts are illustrative, not real student data or a live payment result.
