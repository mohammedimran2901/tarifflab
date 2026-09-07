// TariffLab — monetization layer: freemium gating, Stripe checkout,
// referral attribution, licence activation, partner link generator.
// Loaded BEFORE app.js so the export-gating wrapper can intercept cleanly.
/* global toast:true */

// ================= CONFIG — edit these three lines =================
const TL_CONFIG = {
  STRIPE_PAYMENT_LINK: "https://buy.stripe.com/YOUR_PAYMENT_LINK", // Stripe Dashboard → Payment Links → $290 one-time
  SUPPORT_EMAIL: "hello@example.com",
  FREE_EXPORTS: 2,          // CSV exports allowed before upgrade prompt
  COMMISSION: "30%",        // partner commission
  COMMISSION_USD: 87        // 30% of $290
};
// ===================================================================

const TL = {
  lic: localStorage.getItem("tl_license") || null,
  ref: null,
  exportsUsed: parseInt(localStorage.getItem("tl_exports") || "0", 10),

  isPro() { return !!this.lic; },

  saveLicense(key) {
    this.lic = key;
    localStorage.setItem("tl_license", key);
  },

  // --- referral attribution --------------------------------------
  captureRef() {
    const p = new URLSearchParams(location.search);
    let ref = p.get("ref");
    if (ref) {
      ref = ref.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24);
      if (ref) {
        localStorage.setItem("tl_ref", ref);
        localStorage.setItem("tl_ref_ts", String(Date.now()));
      }
    }
    const ts = parseInt(localStorage.getItem("tl_ref_ts") || "0", 10);
    // 90-day attribution window
    if (Date.now() - ts < 90 * 864e5) this.ref = localStorage.getItem("tl_ref");
  },

  // Stripe Payment Links accept client_reference_id — shows the
  // partner code on the payment record in your Stripe dashboard.
  checkoutUrl() {
    let url = TL_CONFIG.STRIPE_PAYMENT_LINK;
    if (this.ref) url += (url.includes("?") ? "&" : "?") + "client_reference_id=" + encodeURIComponent(this.ref);
    return url;
  },

  // --- licence keys ------------------------------------------------
  // Format TL-XXXX-XXXX-XXXX: 11 base-36 chars + 1 check char.
  // Check char = ((weighted char-code sum + salt) mod 36). Trivially
  // bypassable in a static site — it stops casual sharing, not a
  // determined attacker. Real enforcement = protect data updates.
  SALT: 42807,

  keyCheck(k) {
    let s = this.SALT;
    for (let i = 0; i < k.length; i++) s += k.charCodeAt(i) * (i % 7 + 2);
    return s % 36;
  },

  validKey(input) {
    const k = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (k.length !== 12 || !k.startsWith("TL")) return false;
    const given = parseInt(k.slice(11), 36);
    if (isNaN(given)) return false;
    return given === this.keyCheck(k.slice(0, 11));
  },

  normalizeKey(input) {
    const k = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return "TL-" + k.slice(2, 6) + "-" + k.slice(6, 10) + "-" + k.slice(10, 12);
  }
};

// ---- modal wiring -------------------------------------------------
const modal = document.getElementById("payModal");

function openModal() {
  document.getElementById("stripeLink").href = TL.checkoutUrl();
  document.getElementById("licenseMsg").textContent = TL.isPro() ? "Licence active: " + TL.lic : "";
  modal.classList.remove("hidden");
}
function closeModal() { modal.classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", () => {
  TL.captureRef();

  const upgradeBtn = document.getElementById("upgradeBtn");
  const pricingCTA = document.getElementById("pricingCTA");
  if (upgradeBtn) upgradeBtn.addEventListener("click", openModal);
  if (pricingCTA) pricingCTA.addEventListener("click", openModal);
  document.getElementById("payClose").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  document.getElementById("licenseBtn").addEventListener("click", () => {
    const v = document.getElementById("licenseInput").value;
    const msg = document.getElementById("licenseMsg");
    if (TL.validKey(v)) {
      TL.saveLicense(TL.normalizeKey(v));
      msg.textContent = "✓ Licence activated — unlimited exports unlocked.";
      msg.style.color = "var(--acc2)";
      setTimeout(closeModal, 1200);
      if (typeof toast === "function") toast("TariffLab Pro activated ✓");
    } else {
      msg.textContent = "That key doesn't look right. Check the receipt email or contact " + TL_CONFIG.SUPPORT_EMAIL + ".";
      msg.style.color = "var(--neg)";
    }
  });

  // ---- partner link generator -------------------------------------
  const genBtn = document.getElementById("partnerGenBtn");
  if (genBtn) genBtn.addEventListener("click", () => {
    const code = document.getElementById("partnerCode").value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24);
    if (!code) return;
    const link = location.origin + location.pathname + "?ref=" + encodeURIComponent(code);
    document.getElementById("partnerOutput").classList.remove("hidden");
    document.getElementById("partnerLink").textContent = link;

    const posts = [
      `Most hospital finance teams answer "what if the base rate moves 3%?" in Excel — it takes a day.\n\nTariffLab answers it in seconds, on official published tariffs (US MS-DRG, UK HRG, G-DRG, AR-DRG, UAE IR-DRG).\n\nI've been using it for scenario modelling — worth a look: ${link}\n\n#casemix #hospitalfinance #healthcare #drg`,
      `Case-mix drift is silent. Coding improves, acuity shifts, and your revenue line moves — but nobody can say by how much until budget round.\n\nTariffLab models it per complexity tier, with CMI shown next to the revenue delta: ${link}\n\nFive casemix systems, one screen. Free to try.`,
      `Pricing under one casemix system but benchmarking against another? TariffLab prices the same procedure families side by side under US, UK, German, Australian and UAE weights — built on the published tariff tables, not scraped averages.\n\nTry it: ${link}`
    ];
    const wrap = document.getElementById("partnerPosts");
    wrap.innerHTML = "";
    posts.forEach((p, i) => {
      const box = document.createElement("div");
      box.className = "post-box";
      box.innerHTML = `<div class="lbl">Ready-to-post LinkedIn update ${i + 1} of 3</div><pre class="post-pre"></pre>
        <button class="btn btn-ghost-dark btn-sm post-copy">Copy post</button>`;
      box.querySelector(".post-pre").textContent = p;
      box.querySelector(".post-copy").addEventListener("click", () => {
        navigator.clipboard.writeText(p).then(() => toast("Post copied — paste into LinkedIn ✓"));
      });
      wrap.appendChild(box);
    });
  });

  const copyBtn = document.getElementById("partnerCopyBtn");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("partnerLink").textContent)
      .then(() => toast("Referral link copied ✓"));
  });

  const mail = document.getElementById("partnerMail");
  if (mail) mail.href = "mailto:" + TL_CONFIG.SUPPORT_EMAIL + "?subject=TariffLab%20growth%20partner";
});

// ---- export gating -------------------------------------------------
// Intercept export clicks at CAPTURE phase, before app.js's handlers:
// an unlicensed user who has burned the free exports is blocked from
// downloading and shown the upgrade modal.
document.addEventListener("DOMContentLoaded", () => {
  ["exportBtn", "portCSVBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", ev => {
      if (TL.isPro()) return;                       // licensed → app.js handles it
      if (TL.exportsUsed < TL_CONFIG.FREE_EXPORTS) { // free tier → allow, count it
        TL.exportsUsed += 1;
        localStorage.setItem("tl_exports", String(TL.exportsUsed));
        const left = TL_CONFIG.FREE_EXPORTS - TL.exportsUsed;
        if (typeof toast === "function") toast(left > 0 ? `Export downloaded — ${left} free export${left === 1 ? "" : "s"} left` : "That was your last free export");
        return;
      }
      ev.stopPropagation();  // block app.js's download handler
      ev.preventDefault();
      openModal();
    }, true);
  });
});

