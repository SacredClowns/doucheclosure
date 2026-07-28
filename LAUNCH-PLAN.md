# DOUCHECLOSURE.COM — Launch Plan

The arcade is built. This is the checklist that takes it from folder to live storefront.

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The arcade homepage — 3D UFO hero (the actual model from the Disclosure game), vending wall, Daily Debrief feed, email squeeze |
| `cookbook.html` | The $5 squeeze/sales page for TO SERVE CRAB PEOPLE |
| `daily/chain-of-custody-watch.html` | Daily Debrief article #1 — the template all future dailies follow |
| `assets/ufo.glb` | The 3D UFO (extracted from `ufo-alleys-brooke.html` in the sacred clowns game folder) |
| `assets/three.module.min.js`, `assets/loaders/`, `assets/utils/` | Three.js runtime, vendored locally (no CDN dependency) |

The product itself lives at `New folder\TO SERVE CRAB PEOPLE\to-serve-crab-people.html` — one self-contained file, which is exactly what you upload to the payment provider for delivery.

## 1. Payments — the $5 candy machine (do this first)

**Recommended: Gumroad** (or Lemon Squeezy — same idea). Why: it hosts the file, handles the card, delivers the download, and deals with sales tax/VAT. Zero backend. A candy machine.

1. Create the product, upload `to-serve-crab-people.html`, price $5.
2. Copy your product link.
3. In `cookbook.html`, replace both `#REPLACE-WITH-PAYMENT-LINK` hrefs with it (search for `REPLACE-ME`).

Later, when you want checkout ON the domain instead of a redirect, swap to Stripe Payment Links or Lemon Squeezy overlay embed — one script tag, same buttons.

## 2. Email — the watch list

Pick one: **Buttondown** (simplest, great for daily emails), ConvertKit, or Mailchimp.
- Create the list, grab the form action URL, replace `#REPLACE-WITH-EMAIL-PROVIDER` in `index.html`.
- The Daily Debrief doubles as the newsletter: publish the article, paste it into the email, send. One piece of content, two channels.

## 3. Hosting + domain

Any static host works — this site is pure files, no build step.
- **Cloudflare Pages** (recommended: free, fast, easy custom domain) or Netlify/Vercel.
- Drag this folder in (or connect a repo), then point `doucheclosure.com` DNS at it.
- Done. The UFO flies on your domain.

## 4. The daily content engine

The cadence: **one Daily Debrief post per day**, spoofing whatever UFO Twitter / disclosure world did that day, always filed in the house voice: *we believe everything; we question the logistics.*

Workflow (I can run this with you daily):
1. Feed me the day's story (link, tweet, hearing clip) — or I sweep the usual suspects.
2. I write the Debrief in the standards-desk voice, as a new file in `daily/`.
3. Add the headline card to `index.html`'s Daily Debrief section (newest on top).
4. Same text goes out to the email list.

Recurring formats to rotate: **Chain of Custody Watch** (Day N counter — it only gets funnier), **The Two Weeks Report** (disclosure is always two weeks away), **Egg Status**, **Hearing Minutes (Redacted)**, **This Week in Beings**.

## 5. The roadmap — filling the vending wall

Each new slot = a $2–$10 digital item. Ideas already stubbed on the wall:
- **Mantis Being Couples Counseling** — audio comedy program (parody-machine can produce this)
- **The Extended Footage** — 24-second video, one extra second of a guy saying "huh"
- **Disclosure Countdown Clock** — an HTML toy that always says TWO WEEKS
- **Egg (Unknown Origin)** — interactive egg page; it hums; $3; it never hatches
- Print/PDF edition of the cookbook at a higher price point ($15 print-ready file, or actual print-on-demand via Lulu)

**Merch (Phase 2):** Printful or Fourthwall connected to the same site — "ZERO FUCKING LEFTOVERS" apron, "TRITIUM IS NOT AN INGREDIENT" shot glass, "STILL NO COOLER" dad hat. Fourthwall can also take over checkout for everything if the catalog grows.

## Notes

- Preview locally: the dev server config is in `.claude/launch.json` (`doucheclosure`, port 8734). The 3D hero needs http:// — it won't load over file://.
- Everything is self-hosted (no CDNs), so the site works even if the internet is having a disclosure event.
- All buy buttons and the email form are marked with `REPLACE-ME` comments — two minutes of find-and-replace once accounts exist.
