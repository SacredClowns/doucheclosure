# DOUCHECLOSURE — HOUSE DOCTRINE
*Read this before writing a line. Any Claude Code instance working in this project inherits these rules.*

## What this is
`doucheclosure.com` — a satire arcade about the UFO-disclosure world. 14 "wings," one per public
figure. Each wing = a comedy landing page + playable game(s) + a **$5 Full Experience** bundle
containing the game, a lore dossier, and a genuinely useful software tool.

Live site repo: `SacredClowns/doucheclosure` (public — GitHub Pages, custom domain).
This repo: the studio — briefs, specs, roadmap, product masters. Private.

## The comedy engine (non-negotiable)
**TOTAL BELIEF.** We never say a witness is lying. We accept every claim at face value and then
audit the *logistics* — the invoices, the paperwork, the chain of custody, the refrigeration, the
parking validation. "He killed a crab person? Fine. Where's the cooler?" That's the whole engine.

- **Punch at:** institutions, invoices, secrecy architecture, monetizers, dunk-farming commentators.
- **Never punch at:** experiencers, illness, faith, family, military service, grief.
- **Equal-opportunity offender.** Doucheclosure roasts itself hardest — see the self-shrine at
  `/shrines/#doucheclosure`. Keep that posture; it's the site's armor.
- Tone reference: fully committed absurdity, deadpan bureaucratic delivery, no winking apology.
  The bar the client set: *"Matt Stone and Trey Parker have to crack up."*

## Hard rules
1. **No fabricated quotes** attributed to real people in prose/dossiers. Obviously-absurd cartoon
   dialogue inside a game is fine and established. Prose must describe public claims as claims.
2. **Never invent a booking contact, social handle, agent, or URL.** Wrong booking info misroutes a
   real person's income or points fans at an impersonator. Unverified = render "AWAITING VERIFIED
   LINK." See `/shrines/` link policy.
3. **The tool must be real.** Every $5 bundle ships software a stranger who gets none of the jokes
   would still use next week (FOIA generator, invoicing app, video frame analyzer, breathwork timer,
   timezone planner). Comedy lives in labels/microcopy/footers ONLY — functional output is dead
   serious and must actually work.
4. **Client-side only.** No servers, no network calls, localStorage only, works offline. Privacy is
   part of the product, especially for experiencers.
5. **Every game needs a mechanically distinct core loop.** The mechanic *is* the joke. Do not ship a
   third "dodge things and press space" game. Inventory of used loops is in `HANDOFF-DAGMAS.md`.

## The other half: the shrines
`/shrines/` promotes and **books** the figures — their record, clips, socials, and booking info —
plus **The House Tip**: a share of what each wing earns goes to the person it's about, and a standing
offer to correct links or take a wing down on request. Honor that literally. The site's mission is to
*help* witnesses, not farm them.

## Technical
- Static site. No build step currently. Vanilla JS, canvas, Three.js (vendored in `/assets/`).
- No CDNs, ever — everything self-hosted so the site can't break from someone else's outage.
- Deploy = commit + push to `main` on the public repo; GitHub Pages builds automatically.
- Backend (Daily Debrief CMS + admin panel at `/admin/`) runs on Supabase project "Particle Studio."
- Every game: syntax-check with `node --check` on the extracted script before pushing.

## Current status
14 wings live, ~20 games, 15 tools, 14 bundle zips packaged. **No payment processor connected yet**
— all buy buttons are `#REPLACE-WITH-PAYMENT-LINK` placeholders, intentionally, until quality is up.
