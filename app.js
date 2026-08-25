// TariffLab — scenario engine over the verified casemix dataset
const SYS_META = {
  us: { label: "US MS-DRG", cur: "$", mode: "price",
        note: "Payment = published national payment (weight × $7,276.76), before geographic adjustment." },
  uk: { label: "UK NHS HRG", cur: "£", mode: "price",
        note: "Elective unit price, NHS Payment Scheme 2025/26 Annex A, before Market Forces Factor." },
  de: { label: "German G-DRG", cur: "€", mode: "weight", defaultRate: 4500,
        note: "Payment = relative weight × state base rate (€). Default base rate shown is illustrative — set your own." },
  au: { label: "Australian AR-DRG", cur: "A$", mode: "weight", defaultRate: 5900,
        note: "Payment = NEP price weight × National Efficient Price (A$). 2025–26 NEP ≈ $5,901.70 — adjust as needed." },
  ae: { label: "UAE IR-DRG", cur: "AED ", mode: "weight", defaultRate: 8000,
        note: "Payment = relative weight × facility-negotiated base rate (AED). Default shown is illustrative." }
};

const procSelect = document.getElementById("procSelect");
const sysSelect = document.getElementById("sysSelect");
const inputsWrap = document.getElementById("inputsWrap");
const tbody = document.querySelector("#tierTable tbody");
const summaryEl = document.getElementById("summary");

let chart = null;
let lastRows = [];

// ---- data access -----------------------------------------------------------
function getSystem(name, sys) {
  if (sys === "us" || sys === "uk") {
    const p = PROCEDURES.find(x => x.name === name);
    return p ? p[sys] : null;
  }
  const store = { de: DE, au: AU, ae: AE }[sys];
  return typeof store !== "undefined" ? store[name] : null;
}

function unitRate(sys, tier, baseRate) {
  const meta = SYS_META[sys];
  return meta.mode === "price" ? tier.price : tier.weight * baseRate;
}

function fmt(v, sys) {
  const neg = v < 0;
  return (neg ? "−" : "") + SYS_META[sys].cur + Math.abs(Math.round(v)).toLocaleString();
}

// ---- controls --------------------------------------------------------------
PROCEDURES.map(p => p.name).sort((a, b) => a.localeCompare(b)).forEach(n => {
  const o = document.createElement("option");
  o.value = n; o.textContent = n;
  procSelect.appendChild(o);
});

// ---- inputs ----------------------------------------------------------------
function renderInputs() {
  const name = procSelect.value, sys = sysSelect.value;
  const data = getSystem(name, sys);
  const meta = SYS_META[sys];
  if (!data) { inputsWrap.innerHTML = "<p class='fineprint'>Mapping pending for this family.</p>"; return; }

  let html = "";
  [["baseline", "Baseline", "Current year"], ["scenario", "Scenario", "What-if"]].forEach(([key, title, sub]) => {
    html += `<div class="card scenario-card" data-sc="${key}">
      <div class="scenario-title">${title}</div>
      <div class="scenario-sub">${sub} — cases per complexity tier${meta.mode === "weight" ? " and base rate" : ""}</div>
      <div class="tier-grid">`;
    if (meta.mode === "weight") {
      const def = key === "scenario" ? ` value="${meta.defaultRate}"` : "";
      html += `<div class="tier-box"><div class="t-name">Base rate</div>
        <label>${meta.cur} per weight unit
          <input type="number" min="0" step="1" class="base-rate"${def} placeholder="${meta.defaultRate}">
        </label></div>`;
    }
    data.tiers.forEach((t, i) => {
      const vol = i === 0 ? 100 : 40; // sensible starter mix
      const alos = t.alos != null ? ` · ALOS ${t.alos.toFixed(1)}d` : "";
      html += `<div class="tier-box">
        <div class="t-name">${t.tier}</div><div class="t-code">${t.code}${alos}</div>
        <label>Cases<input type="number" min="0" class="vol" value="${vol}" data-i="${i}"></label>
      </div>`;
    });
    html += "</div></div>";
  });
  inputsWrap.innerHTML = html;

  // restore any pending shared state before first compute
  if (pendingState && pendingState.n === name && pendingState.s === sys) {
    applyStateToInputs(pendingState);
    pendingState = null;
  }
  compute();
}

// ---- compute & render ------------------------------------------------------
function readScenario(key, data, sys) {
  const card = document.querySelector(`[data-sc="${key}"]`);
  const meta = SYS_META[sys];
  const brInput = card && card.querySelector(".base-rate");
  const baseRate = brInput ? (parseFloat(brInput.value) || meta.defaultRate || 0) : 0;
  const rows = data.tiers.map((t, i) => {
    const volInp = card.querySelector(`.vol[data-i="${i}"]`);
    const cases = parseFloat(volInp.value) || 0;
    const rate = unitRate(sys, t, baseRate);
    return { tier: t.tier, code: t.code, cases, rate, revenue: cases * rate,
             weight: t.weight != null ? t.weight : null };
  });
  return { baseRate, rows };
}

function compute() {
  const name = procSelect.value, sys = sysSelect.value;
  const data = getSystem(name, sys);
  if (!data) return;

  const base = readScenario("baseline", data, sys);
  const scen = readScenario("scenario", data, sys);

  tbody.innerHTML = "";
  lastRows = [];
  data.tiers.forEach((t, i) => {
    const b = base.rows[i], s = scen.rows[i], d = s.revenue - b.revenue;
    lastRows.push({ ...b, scenCases: s.cases, scenRate: s.rate, scenRev: s.revenue, delta: d });
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${t.tier}</td><td class="code-cell">${t.code}</td>
      <td>${fmt(b.rate, sys)}</td>
      <td>${b.cases.toLocaleString()}</td><td>${fmt(b.revenue, sys)}</td>
      <td>${s.cases.toLocaleString()}</td><td>${fmt(s.revenue, sys)}</td>
      <td class="${d >= 0 ? "pos" : "negv"}">${fmt(d, sys)}</td>`;
    tbody.appendChild(tr);
  });

  const totB = base.rows.reduce((a, r) => a + r.revenue, 0);
  const totS = scen.rows.reduce((a, r) => a + r.revenue, 0);
  const dTot = totS - totB;
  const pct = totB ? (100 * dTot / totB) : 0;
  const wsum = arr => arr.reduce((a, r) => a + r.cases * (r.weight || 0), 0);
  const csum = arr => arr.reduce((a, r) => a + r.cases, 0);
  const cmiB = csum(base.rows) ? wsum(base.rows) / csum(base.rows) : null;
  const cmiS = csum(scen.rows) ? wsum(scen.rows) / csum(scen.rows) : null;

  summaryEl.innerHTML = `
    <div class="stat-card"><div class="lbl">Revenue · baseline</div><div class="val">${fmt(totB, sys)}</div></div>
    <div class="stat-card"><div class="lbl">Revenue · scenario</div><div class="val">${fmt(totS, sys)}</div></div>
    <div class="stat-card"><div class="lbl">Δ revenue</div><div class="val ${dTot >= 0 ? "pos" : "negv"}">${fmt(dTot, sys)}</div></div>
    <div class="stat-card"><div class="lbl">Δ %</div><div class="val ${dTot >= 0 ? "pos" : "negv"}">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%</div></div>
    ${cmiB != null ? `<div class="stat-card"><div class="lbl">CMI baseline → scenario</div><div class="val">${cmiB.toFixed(3)} → ${cmiS.toFixed(3)}</div></div>` : ""}
    ${SYS_META[sys].mode === "weight" ? `<div class="stat-card"><div class="lbl">Base rate Δ</div><div class="val">${fmt(scen.baseRate - base.baseRate, sys)}${base.baseRate ? " (" + (100 * (scen.baseRate - base.baseRate) / base.baseRate).toFixed(1) + ")%" : ""}</div></div>` : ""}
  `;

  document.getElementById("sourceNote").textContent = SYS_META[sys].note;

  const ctx = document.getElementById("chart").getContext("2d");
  const labels = data.tiers.map(t => t.tier);
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Baseline revenue", data: base.rows.map(r => r.revenue), backgroundColor: "#38bdf8" },
        { label: "Scenario revenue", data: scen.rows.map(r => r.revenue), backgroundColor: "#34d399" }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: "#8b98a9" } } },
      scales: {
        x: { ticks: { color: "#8b98a9" }, grid: { color: "#1f2937" } },
        y: { ticks: { color: "#8b98a9", callback: v => fmt(v, sys) }, grid: { color: "#1f2937" } }
      }
    }
  });
}

// ---- CSV export ------------------------------------------------------------
document.getElementById("exportBtn").addEventListener("click", () => {
  if (!lastRows.length) return;
  const head = ["tier","code","unit_rate_baseline","cases_baseline","revenue_baseline",
                "unit_rate_scenario","cases_scenario","revenue_scenario","delta_revenue"];
  const lines = [head.join(",")];
  lastRows.forEach(r => lines.push([
    `"${r.tier}"`, r.code, r.rate.toFixed(2), r.cases, Math.round(r.revenue),
    r.scenRate.toFixed(2), r.scenCases, Math.round(r.scenRev), Math.round(r.delta)
  ].join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tarifflab-scenario.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});



let pendingState = null;

const b64url = {
  enc: s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""),
  dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))
};

function currentState() {
  const sys = sysSelect.value, name = procSelect.value;
  const data = getSystem(name, sys);
  if (!data) return null;
  const grab = key => {
    const card = document.querySelector(`[data-sc="${key}"]`);
    return {
      r: card.querySelector(".base-rate") ? (parseFloat(card.querySelector(".base-rate").value) || null) : null,
      v: [...card.querySelectorAll(".vol")].map(i => parseFloat(i.value) || 0)
    };
  };
  return { n: name, s: sys, b: grab("baseline"), c: grab("scenario") };
}

function applyStateToInputs(st) {
  [[document.querySelector('[data-sc="baseline"]'), st.b],
   [document.querySelector('[data-sc="scenario"]'), st.c]].forEach(([card, side]) => {
    if (!card || !side) return;
    if (side.r != null) { const br = card.querySelector(".base-rate"); if (br) br.value = side.r; }
    card.querySelectorAll(".vol").forEach((inp, i) => { if (side.v[i] != null) inp.value = side.v[i]; });
  });
}

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

document.getElementById("shareBtn").addEventListener("click", () => {
  const st = currentState();
  if (!st) return toast("Nothing to share yet");
  const url = location.origin + location.pathname
    + "?d=" + b64url.enc(JSON.stringify(st)) + (location.hash || "");
  history.replaceState(null, "", url);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => toast("Shareable link copied to clipboard ✓"))
      .catch(() => toast("Link is in the address bar — copy it from there"));
  } else {
    toast("Link is in the address bar — copy it from there");
  }
});

// ---- portfolio rollup -------------------------------------------------------
const FX = { us: 1.0, uk: 1 / 0.79, de: 1 / 0.92, au: 1 / 0.65, ae: 1 / 0.27 }; // → USD

let portfolio = JSON.parse(localStorage.getItem("tl_portfolio") || "[]");

function portEntryRevenue(e) {
  const data = getSystem(e.n, e.s);
  if (!data) return null;
  const rev = side => data.tiers.reduce((a, t, i) =>
    a + (side.v[i] || 0) * unitRate(e.s, t, side.r || SYS_META[e.s].defaultRate || 0), 0);
  return { b: rev(e.b), s: rev(e.c) };
}

function renderPortfolio() {
  localStorage.setItem("tl_portfolio", JSON.stringify(portfolio));
  document.getElementById("portfolioSection").classList.toggle("hidden", !portfolio.length);
  const tb = document.querySelector("#portTable tbody");
  tb.innerHTML = "";
  let totB = 0, totS = 0;
  portfolio.forEach((e, idx) => {
    const r = portEntryRevenue(e);
    if (!r) return;
    const usdB = r.b * FX[e.s], usdS = r.s * FX[e.s];
    totB += usdB; totS += usdS;
    const d = usdS - usdB, pct = usdB ? 100 * d / usdB : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${e.n}</td><td>${SYS_META[e.s].label}</td>
      <td>$${Math.round(usdB).toLocaleString()}</td>
      <td>$${Math.round(usdS).toLocaleString()}</td>
      <td class="${d >= 0 ? "pos" : "negv"}">$${Math.round(d).toLocaleString()}</td>
      <td class="${d >= 0 ? "pos" : "negv"}">${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%</td>`;
    tr.title = "Click to load this scenario back into the calculator";
    tr.style.cursor = "pointer";
    tr.addEventListener("click", () => {
      procSelect.value = e.n; sysSelect.value = e.s;
      pendingState = { n: e.n, s: e.s, b: e.b, c: e.c };
      renderInputs();
      document.getElementById("lab").scrollIntoView({ behavior: "smooth" });
    });
    tb.appendChild(tr);
  });
  const dTot = totS - totB, pctTot = totB ? 100 * dTot / totB : 0;
  document.getElementById("portSummary").innerHTML = `
    <div class="stat-card"><div class="lbl">Portfolio · baseline</div><div class="val">$${Math.round(totB).toLocaleString()}</div></div>
    <div class="stat-card"><div class="lbl">Portfolio · scenario</div><div class="val">$${Math.round(totS).toLocaleString()}</div></div>
    <div class="stat-card"><div class="lbl">Portfolio Δ revenue</div><div class="val ${dTot >= 0 ? "pos" : "negv"}">$${Math.round(dTot).toLocaleString()}</div></div>
    <div class="stat-card"><div class="lbl">Portfolio Δ %</div><div class="val ${dTot >= 0 ? "pos" : "negv"}">${pctTot >= 0 ? "+" : ""}${pctTot.toFixed(1)}%</div></div>
    <div class="stat-card"><div class="lbl">Families in portfolio</div><div class="val">${portfolio.length}</div></div>`;
}

document.getElementById("addPortBtn").addEventListener("click", () => {
  const st = currentState();
  if (!st) return toast("Nothing to add yet");
  portfolio = portfolio.filter(e => !(e.n === st.n && e.s === st.s));
  portfolio.push({ n: st.n, s: st.s, b: st.b, c: st.c });
  renderPortfolio();
  toast("Added to portfolio ✓");
});

document.getElementById("portClearBtn").addEventListener("click", () => {
  portfolio = [];
  renderPortfolio();
});

document.getElementById("portCSVBtn").addEventListener("click", () => {
  if (!portfolio.length) return;
  const lines = ["family,system,revenue_baseline_usd,revenue_scenario_usd,delta_usd,delta_pct"];
  let totB = 0, totS = 0;
  portfolio.forEach(e => {
    const r = portEntryRevenue(e);
    if (!r) return;
    const B = r.b * FX[e.s], S = r.s * FX[e.s];
    totB += B; totS += S;
    const d = S - B, pct = B ? 100 * d / B : 0;
    lines.push(`"${e.n}",${SYS_META[e.s].label},${Math.round(B)},${Math.round(S)},${Math.round(d)},${pct.toFixed(1)}`);
  });
  lines.push(`TOTAL,,${Math.round(totB)},${Math.round(totS)},${Math.round(totS - totB)},${totB ? (100 * (totS - totB) / totB).toFixed(1) : 0}`);
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tarifflab-portfolio.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});

// ---- single delegated listener (fixes duplicate-compute on re-render) -------
inputsWrap.addEventListener("input", compute);

// ---- startup -----------------------------------------------------------------
procSelect.addEventListener("change", renderInputs);
sysSelect.addEventListener("change", renderInputs);

(function init() {
  const params = new URLSearchParams(location.search);
  const d = params.get("d");
  if (d) {
    try {
      pendingState = JSON.parse(b64url.dec(d));
      procSelect.value = pendingState.n;
      sysSelect.value = pendingState.s;
    } catch (e) { console.warn("Bad share link", e); }
  }
  renderInputs();
  renderPortfolio();
})();

