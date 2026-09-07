# TariffLab — LinkedIn Growth Partner Playbook

How to turn TariffLab into recurring revenue using yourself (and recruited
partners) as distribution on LinkedIn. Model: **$290/team/yr licence, 30%
commission ($87) per referred sale.**

---

## 1. The revenue engine

```
LinkedIn post / DM  →  your-link.com/?ref=YOURCODE  →  free scenarios
                    →  2 free CSV exports burned    →  upgrade modal
                    →  Stripe ($290, client_reference_id=YOURCODE)
                    →  Stripe dashboard shows YOURCODE → pay 30% monthly
```

Everything above already exists in the product. Your job is only the
left-hand side: **attention**.

## 2. Who buys (ICP)

| Buyer | Why they pay | Where to find them on LinkedIn |
|---|---|---|
| Hospital CFO / finance directors | Budget rounds = revenue-impact questions they currently do in Excel | Search "hospital finance director", "CFO hospital" |
| Casemix / clinical coding managers | CMI is *their* KPI | "casemix manager", "clinical coding manager" |
| Health-economics & market-access consultants | Use it in client deliverables; buy a seat per engagement | "market access consultant", "health economics" |
| Revenue-cycle / contracting analysts (US) | MS-DRG payment modelling is daily work | "revenue integrity", "Medicare reimbursement analyst" |
| GCC health-payor teams (DHA, DoH, CHI-linked) | IR-DRG + base-rate negotiation is a live topic | "casemix" + UAE/Saudi |

## 3. Your offer to partners

- **30% commission per licence** ($87) — paid monthly by bank transfer or Stripe Connect.
- Partners get a `?ref=code` link; attribution is automatic via Stripe's
  `client_reference_id` on the payment record (no tracking infra needed).
- Partners can also use TariffLab **free Pro** themselves (issue them a
  licence key) — they post from genuine use, which converts far better.
- Target partners: independent health-economics consultants, casemix
  trainers, coding-audit firms, healthcare newsletters, "medtech
  fractional CMO" types. Anyone with 3k+ relevant followers.

### Recruiting DM template
> Hi [Name] — I build TariffLab, a scenario tool hospital finance/casemix
> teams use to model DRG revenue impacts on official tariffs (US/UK/DE/AU/UAE).
>
> I'm inviting a few people in the casemix space to be growth partners:
> free Pro licence for you, your own referral link, and 30% of every
> $290 licence your link produces (tracked automatically in Stripe, paid
> monthly). No obligation — most partners just share a post when they'd
> naturally mention it anyway.
>
> Want your link? It takes 30 seconds.

## 4. Content system (you, 3 posts/week)

Rotate four archetypes — never "check out my tool" two days in a row:

**A. Mini case (Mon)** — "A hospital coding team moved 12% of cases from
minor to major complexity. Here's what that's worth in [system]" + screenshot
from the tool (blur any client detail). Numbers in post = reach.

**B. Contrarian/insight (Wed)** — e.g. "Germany pays hip replacements by
*weight × base rate*. Australia by weight × national price. The UK by a flat
elective price. Same surgery, three very different games." End with the lab link.

**C. Build in public (Fri)** — "Added UAE IR-DRG to TariffLab this week.
Here's the verification process for tariff data" — credibility + goodwill.

**D. Direct offer (1×/month)** — Founding-customer price, what's included,
link. Pin this one to your profile.

**Every post:** one idea, one number, one screenshot, link in the post (not
comments — LinkedIn downranks comment-only links less than it used to, and
in-post converts better for niche B2B).

## 5. The 30-day launch calendar

| Week | Actions |
|---|---|
| 1 | Deploy site (Netlify drag-and-drop), create Stripe Payment Link ($290, success URL `?success=1`), paste into `monetize.js` line 9. Fix `og:url` to your real domain. Post A, post C. DM 10 consultants with the recruiting template. |
| 2 | Post B, post A. Comment daily on 5 casemix/health-economics posts (visibility > followers). DM 20 ICP individuals offering the free 2-export trial link. |
| 3 | Recruit 2–5 partners formally (send them licence keys + their links). Post C about a partner use-case. |
| 4 | Direct offer post. Review Stripe dashboard: which ref codes converted. Double down on whichever channel produced clicks. |

**Realistic first-year math:** 1,000 relevant LinkedIn connections converting
at industry-standard 0.5–1% to a paid $290 licence = 5–10 licences
($1,450–$2,900 direct). With 5 active partners each doing 1–2 sales/quarter,
that's another $4,350–$17,400 in commission payments to them — and
$10,150–$40,600 in gross licence revenue to you.

## 6. Operating notes

- **Attribution check:** In Stripe, each payment's `client_reference_id`
  holds the partner code. Monthly: filter payments, sum per code, pay 30%.
- **Issue partner keys:** run the key generator (see README) — each key is
  checked client-side by `monetize.js`.
- **Upgrade later:** if volume justifies it, move licences behind a tiny
  backend (Stripe webhook → signed keys) and add Stripe Connect for
  automatic partner payouts.
- **Honesty rule that keeps conversions high:** always say "reference
  modelling tool — verify against local pricing analysis." Credibility is
  the product in this niche.

## 7. File map

| File | Role |
|---|---|
| `monetize.js` | Config (Stripe link, free exports), paywall, referral capture, licence validation, partner link generator |
| `index.html` | Upgrade modal, #partners section, OG tags for LinkedIn previews |
| `styles.css` | Modal + partner-section styles |
