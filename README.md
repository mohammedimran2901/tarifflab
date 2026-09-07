# TariffLab — DRG tariff & case-mix scenario modelling

Static SaaS MVP: model revenue impact of base-rate changes, case-mix drift
and casemix-system switches across **US MS-DRG, UK HRG, German G-DRG,
Australian AR-DRG and UAE IR-DRG** using official published tariffs.

Monetized: **$290 / team / year** licence, sold via Stripe Payment Link, with
a **30% LinkedIn growth-partner program** built in.

## Run locally

```bash
cd tariff-scenario-lab
python3 -m http.server 8000   # then open http://localhost:8000
```

## How the money works

| Mechanism | Where |
|---|---|
| Free tier — unlimited scenarios & share links; 2 free CSV exports | `monetize.js` (`TL_CONFIG.FREE_EXPORTS`) |
| Upgrade modal + Stripe checkout | `#payModal` in `index.html`, `openModal()` in `monetize.js` |
| Licence keys (TL-XXXX-XXXX-XXXX, checksum-validated) | `TL.validKey()` in `monetize.js` |
| Partner links `?ref=code` → 90-day attribution → Stripe `client_reference_id` | `TL.captureRef()` / `TL.checkoutUrl()` |
| Partner link + 3 ready-to-post LinkedIn updates generator | `#partners` section in `index.html` |

## Launch checklist

1. **Stripe:** Dashboard → Payment Links → **+ New** → $290 one-time,
   "After payment" → redirect to `https://YOURDOMAIN/?success=1`. Copy the
   `buy.stripe.com/...` URL into `monetize.js` → `TL_CONFIG.STRIPE_PAYMENT_LINK`.
2. **Email:** set your real address in `TL_CONFIG.SUPPORT_EMAIL` and in the
   partner-section fine print.
3. **OG tags:** set `og:url` (and ideally `og:image`) in `index.html` to your
   real domain so LinkedIn link previews look right.
4. **Deploy:** drag-and-drop the folder onto Netlify / Vercel / GitHub Pages.
5. **Read `GROWTH-PARTNER-PLAYBOOK.md`** for the 30-day LinkedIn launch plan,
   DM templates and post calendar.

## Licence keys (sample — issue to partners / direct buyers)

```
TL-U5TE-ICX6-E6
TL-ZE1G-BJ4Z-4Z
TL-2VDB-QRIY-O9
TL-HKSW-G6O2-FW
TL-N2T0-SE5W-LY
TL-WUTK-4TBK-0V
```

Generate more (same algorithm as `TL.keyCheck`, SALT 42807):

```bash
node -e "
const SALT=42807;
const keyCheck=k=>{let s=SALT;for(let i=0;i<k.length;i++)s+=k.charCodeAt(i)*((i%7)+2);return s%36;};
const C36='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const body=()=>{let c='TL';for(let i=0;i<9;i++)c+=C36[Math.floor(Math.random()*36)];return c;};
const out=new Set(); while(out.size<5){const b=body();const k=b+C36[keyCheck(b)];out.add('TL-'+k.slice(2,6)+'-'+k.slice(6,10)+'-'+k.slice(10,12));}
console.log([...out].join('\n'));"
```

⚠️ Client-side key checks stop casual sharing, not a determined attacker.
For real enforcement later: move key issuance behind a webhook endpoint and
gate the tariff-data updates instead of the UI.

## Disclaimer

Reference modelling tool — not a certified grouping engine. Verify against
local pricing analysis. Not affiliated with CMS, NHS England, InEK, IHACPA
or DoH Abu Dhabi.
