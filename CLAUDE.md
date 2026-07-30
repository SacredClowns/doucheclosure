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

## THE FUNNY PROBLEM — read this before writing any game
Real audience feedback, 2026-07-30: *"People say it's a great idea, it's just not funny and the
games suck."* That is fair. Here is the diagnosis and the fix. **Violating these is worse than
shipping late.**

**What went wrong**
1. **Clever ≠ funny.** Elegant deadpan bureaucratic prose reads as smart. It does not make anyone
   laugh out loud. The bar is Stone/Parker: escalate past comfort, commit, don't be tasteful.
2. **Jokes were buried in prose nobody reads.** The best lines sat in wing-page paragraphs while the
   actual gameplay ran silent. **Comedy must live in the moment-to-moment, not the essay.**
3. **Puzzle verbs are not toy verbs.** "Constraint-satisfaction scheduling" is interesting to
   describe and boring to play. We shipped spreadsheets with jokes printed on them.
4. **No escalation.** Flat difficulty, flat jokes, same register start to finish.
5. **Sincerity inflation.** A warm moving ending is devastating ONCE. We did it in nearly every
   game, which makes the whole site earnest. Earnest is the enemy of funny.

**The rules now**
- **Every click produces a stupid visible consequence.** No silent actions, ever.
- **Escalate.** Round 1 deadpan, round 8 indefensible. The game should get MORE unhinged, not just
  harder. Use `Riff` tiers (below) — that's what they're for.
- **Be specific.** "A raccoon wearing a lanyard" beats "an animal." Names, brands, weirdly exact
  numbers. Specificity is 80% of the laugh.
- **Fail states must be funnier than win states.** Losing should be worth doing on purpose.
- **Break the rule of three.** Set a pattern, then violate it once, hard.
- **Sincere endings are RATIONED — at most one wing in five.** Everywhere else, land the joke.
- **Cut any sentence that is merely well-written.** If it isn't funny, it's set dressing. Delete it.

**The comedy engine: `assets/riff.js`**
A live commentary track that reacts to what the player actually did and gets more deranged over
time. This is where the jokes belong now.
```js
Riff.init({ mount:'#annc', bank:{
  good:[ 'deadpan line', [2,'weirder line'], [3,'indefensible line'] ],
  bad :[ [1,'…'], [3,'…'] ], streak:[…], fail:[…]
}});
Riff.hit('bad', { thing:'CLAW' });   // {thing}, {n} and {nth} substitute automatically
```
Lines are tiered 1-3 and escalate with play. Repeats are suppressed. `{nth}` gives you free
callbacks — *"that's the fourth time you've done that"* is funnier than any written joke.
**Minimum bar: 6+ lines per trigger, spanning all three tiers.**

**FEVER MODE (on by default).** Riff drives `Optics`: as the commentary escalates, bloom, barrel
curvature, chromatic aberration, grain and flicker all climb with it, and tier 3 fires a shake and an
alarm. The player is never told. The game just starts to feel like the television is unwell. That
coupling — jokes bending the picture — is what makes it a fever dream instead of a louder game.
Pass `fever:false` for deliberately calm games (Stillness Protocol, Mantis counseling).

**"Funny AND smart" is the actual bar.** South Park's absurdity always carries a real argument.
Every escalation should still be ABOUT something — the logistics failure, the invoice, the
institution. Random weirdness is Family Guy at its worst; weirdness in service of a thesis is Family
Guy at its best. If a tier-3 line isn't secretly making the wing's point, rewrite it.

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
plus a standing offer to correct links, add links, or take a wing down entirely on request. Honor
that literally. The site's mission is to *help* witnesses, not farm them.

**NEVER promise anyone money, revenue share, royalties, or `a cut` anywhere on the site or in any
product.** A public payment promise creates expectations and potential obligations we do not control.
Removed 2026-07-30 at the client's instruction. Promotion and takedown-on-request are the offer; cash
is never mentioned.

## Technical
- Static site. No build step currently. Vanilla JS, canvas, Three.js (vendored in `/assets/`).
- No CDNs, ever — everything self-hosted so the site can't break from someone else's outage.
- Deploy = commit + push to `main` on the public repo; GitHub Pages builds automatically.
- Backend (Daily Debrief CMS + admin panel at `/admin/`) runs on Supabase project "Particle Studio."
- Every game: syntax-check with `node --check` on the extracted script before pushing.

## Current status
14 wings live, ~20 games, 15 tools, 14 bundle zips packaged. **No payment processor connected yet**
— all buy buttons are `#REPLACE-WITH-PAYMENT-LINK` placeholders, intentionally, until quality is up.
