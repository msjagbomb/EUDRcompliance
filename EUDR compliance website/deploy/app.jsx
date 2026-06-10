// app.jsx — Canopy: automated EUDR plot-level due diligence
const { useState, useEffect, useRef } = React;

const FONT_PAIRS = {
  "Schibsted Grotesk": { disp: '"Schibsted Grotesk", system-ui, sans-serif', body: '"Schibsted Grotesk", system-ui, sans-serif' },
  "Space Grotesk": { disp: '"Space Grotesk", system-ui, sans-serif', body: '"Hanken Grotesk", system-ui, sans-serif' },
  "Hanken Grotesk": { disp: '"Hanken Grotesk", system-ui, sans-serif', body: '"Hanken Grotesk", system-ui, sans-serif' }
};

const PALETTES = {
  "Pine & signal": { moss: "oklch(0.55 0.112 156)", mossDeep: "oklch(0.44 0.10 158)", forest: "oklch(0.28 0.045 160)", forest2: "oklch(0.235 0.04 162)", mossTint: "oklch(0.94 0.03 156)" },
  "Forest & bark": { moss: "oklch(0.585 0.122 150)", mossDeep: "oklch(0.47 0.105 152)", forest: "oklch(0.31 0.046 156)", forest2: "oklch(0.26 0.04 158)", mossTint: "oklch(0.94 0.03 150)" },
  "Slate & pine": { moss: "oklch(0.56 0.10 172)", mossDeep: "oklch(0.45 0.092 174)", forest: "oklch(0.29 0.035 220)", forest2: "oklch(0.24 0.03 222)", mossTint: "oklch(0.93 0.025 196)" }
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headlineA": "Prove your timber is",
  "headlineB": "deforestation-free.",
  "palette": "Pine & signal",
  "font": "Schibsted Grotesk",
  "dark": false
} /*EDITMODE-END*/;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {if (e.isIntersecting) {e.target.classList.add("in");io.unobserve(e.target);}});
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", on);on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="wrap nav-inner">
        <a className="brand" href="#top"><span className="brand-mark"><LeafMark /></span> ClearCanopy</a>
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#monitor">Assessment</a>
          <a href="#sources">Data</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-cta">
          <a className="btn btn-ghost" href="#quote">Sign in</a>
          <a className="btn btn-primary" href="#quote">Get a quote <Arrow /></a>
        </div>
      </div>
    </nav>);

}

function Hero({ headlineA, headlineB }) {
  return (
    <header className="hero" id="top">
      <div className="hero-grid"></div>
      <div className="wrap hero-inner">
        <div>
          <div className="deadline" style={{ marginBottom: 22 }}>
            <span className="d"></span> EUDR enforcement begins Dec 30, 2026
          </div>
          <h1>{headlineA}<br /><span className="accent">{headlineB}</span></h1>
          <p className="lead">
            ClearCanopy automates EU Deforestation Regulation (EUDR) plot-level due diligence. Upload your sourcing geodata,
            get an instant <strong>PASS / FAIL</strong> per plot against our database of
            non-compliant land conversions, and export an audit-ready DDS report. We offer
            compliance-grade assessment at a fraction of typical consultant rates.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#quote">Get a quote <Arrow /></a>
          </div>
        </div>
      </div>
    </header>);

}

function Protect() {
  return (
    <section className="section protect" id="protect">
      <div className="wrap">
        <div className="protect-head reveal">
          <h2>Protect your customer<br />relationships. <span className="accent">In minutes.</span></h2>
          <p className="protect-lead">Before you send forestry geodata to a customer, know for certain it's free of deforestation and degradation — according to EUDR guidelines. One upload. Instant results. No consultant required.</p>
          <div className="protect-actions">
            <a className="btn btn-soft" href="#monitor"><IconUpload /> Check your harvest data</a>
            <a className="protect-link" href="#how">See how it works <Arrow /></a>
          </div>
        </div>
        <div className="risk reveal">
          <div className="risk-head"><IconWarn /> The risk no one is talking about</div>
          <p>When you deliver non-compliant geodata to a customer, it's not just a regulatory problem — it can damage trust you've spent years building. EUDR enforcement begins December 30, 2026. Every wood product entering the EU must carry a verified Due Diligence Statement. If your data fails, their shipment fails.</p>
        </div>
      </div>
    </section>);
}

function Problem() {
  const items = [
  { k: "Dec 30", warn: true, h: "2026 deadline", p: "Every wood product entering the EU needs a verified Due Diligence Statement proving no deforestation since Dec 31, 2020 — enforced for large and medium operators from Dec 30, 2026.", src: "EU Reg. 2023/1115 (as amended 2025/2650)" },
  { k: "$20B+", h: "Access at risk", p: "The EU imports roughly $20B of wood products a year — market access that EUDR now gates on plot-level, requiring proof it is deforestation-free.", src: "" },
  { k: "Weeks", h: "The manual way", p: "Current workflows need expensive GIS consultants and weeks of analysis per shipment.", src: "" },
  { k: "", good: true, h: "The only tool", p: "ClearCanopy is the only platform that automates plot-level EUDR due diligence for Canadian & US forestry.", src: "" }];

  return (
    <section className="section" id="problem">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Why now</span>
          <h2>The EUDR clock is running.</h2>
          <p>From December 30, 2026, every large and medium operator placing wood on the EU market must file plot-level geospatial evidence — with small and micro operators following on June 30, 2027. For most teams that still means consultants, spreadsheets and weeks of GIS.</p>
        </div>
        <div className="problem-grid">
          {items.map((it, i) =>
          <div className={"prob reveal" + (it.good ? " prob-good" : "")} key={it.h} style={{ transitionDelay: i * 70 + "ms" }}>
              {it.good && <span className="prob-tag"><span className="prob-mark"><LeafMark size={16} /></span> ClearCanopy</span>}
              {it.k && <div className={"pk" + (it.warn ? " warn" : "") + (it.good ? " good" : "")}>{it.k}</div>}
              <h3>{it.h}</h3>
              <p>{it.p}</p>
              {it.src && <div className="src">{it.src}</div>}
            </div>
          )}
        </div>
      </div>
    </section>);

}

function How() {
  const steps = [
  { ic: <IconUpload />, n: "01", h: "Upload", p: "Drag and drop your sourcing geodata — Shapefile, GeoJSON or KML. Works on iPhone and Windows, no GIS software needed." },
  { ic: <IconScan />, n: "02", h: "Assess", p: "Our AI model, trained on official Canadian & US government land-use records, maps every non-compliant conversion inside your plots against the Dec 2020 baseline." },
  { ic: <IconReport />, n: "03", h: "Report", p: "Get an instant PASS / FAIL per plot, plus a one-click DDS-ready PDF citing the full government-data methodology." }];

  return (
    <section className="section" id="how" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">How it works</span>
          <h2>From geodata to audit-ready, in three steps.</h2>
          <p>No new hardware, no GIS team, no six-week consulting engagement. ClearCanopy does the plot-level assessment the regulation requires.</p>
        </div>
        <div className="steps">
          {steps.map((s, i) =>
          <div className="step reveal" key={s.n} style={{ transitionDelay: i * 90 + "ms" }}>
              <div className="ic">{s.ic}</div>
              <div className="num">{s.n}</div>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Monitor() {
  return (
    <section className="section" id="monitor" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Plot assessment</span>
          <h2>Every sourcing plot, judged against the record.</h2>
          <p>ClearCanopy overlays your plot boundaries on the database of non-compliant land conversions — built from official government land-use records — and returns a clear PASS or FAIL with the evidence behind it. ClearCanopy is now a native Windows app — get it from the Microsoft Store.</p>
        </div>
        <div className="reveal in"><LiveAppEmbed /></div>
      </div>
    </section>);

}

function Sources() {
  const src = [
  { f: "CA", n: "NRCan Forest Change", d: "National forest disturbance & change (30 m)" },
  { f: "CA", n: "Canada Land Inventory", d: "Federal & provincial land-use records" },
  { f: "US", n: "USFS Forests-to-Farm", d: "Forest Service conversion event database" },
  { f: "US", n: "NLCD / LULC Change", d: "National Land Cover Database (2001–2021)" },
  { f: "EU", n: "EU Reference Map", d: "Commission benchmark deforestation layer" },
  { f: "GLOBAL", n: "Hansen GFC · JRC TMF", d: "Global forest-cover change layers" }];

  return (
    <section className="section" id="sources" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">Technical approach</span>
          <h2>Trained on the data auditors trust.</h2>
          <p>ClearCanopy's model is built from official government land-use records and cross-referenced with the Dec 31, 2020 forest baseline — so every verdict is defensible and every report is fully cited.</p>
        </div>
        <div className="sources">
          {src.map((s, i) =>
          <div className="source reveal" key={s.n} style={{ transitionDelay: i * 55 + "ms" }}>
              <span className="flag">{s.f}</span>
              <div><div className="sname">{s.n}</div><div className="sdesc">{s.d}</div></div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

function Cost() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="cost reveal">
          <div className="cost-grid">
            <div>
              <span className="eyebrow">The economics</span>
              <h2>Audit-ready compliance, minus the consultants.</h2>
              <p>Today a single EU shipment means weeks of GIS work and five-figure consultant invoices — repeated for every order. ClearCanopy runs the same plot-level assessment in minutes, so a mid-size exporter can finally afford continuous compliance.</p>
            </div>
            <div className="cost-compare">
              <div className="cc-card them">
                <div className="cc-lab">GIS consultant, per shipment</div>
                <div className="cc-price">$8K+<span className="per">/ shipment</span></div>
                <div className="cc-desc">Weeks of analysis, repeated every order.</div>
              </div>
              <div className="cc-card us">
                <div className="cc-lab">ClearCanopy Pro</div>
                <div className="cc-price">$400<span className="per">/ month</span></div>
                <div className="cc-desc">Up to 500 plots a year. Minutes per plot.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

}

function Pricing() {
  const tiers = [
  { name: "Starter", price: "$100", per: "/mo", limit: "Up to 50 plots / year", feats: ["Self-serve geodata upload", "Instant PASS / FAIL result", "DDS-ready PDF report"], cta: "Get a quote", featured: false, dark: false },
  { name: "Pro", price: "$400", per: "/mo", limit: "Up to 500 plots / year", feats: ["Everything in Starter", "Priority processing", "API access", "White-label PDF"], cta: "Get a quote", featured: true, dark: false },
  { name: "Enterprise", price: "Custom", per: "", limit: "Unlimited plots", feats: ["Everything in Pro", "Dedicated success manager", "Custom integrations", "SLA guarantee"], cta: "Contact sales", featured: false, dark: false }];

  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="section-head reveal" style={{ maxWidth: 640, marginInline: "auto", textAlign: "center" }}>
          <span className="eyebrow">Pricing</span>
          <h2>Flat plans, scaled to how much you ship.</h2>
          <p>Pick a plan by annual plot volume. Per-report pricing is available for infrequent shippers.</p>
        </div>
        <div className="tiers">
          {tiers.map((t, i) =>
          <div className={"tier reveal" + (t.featured ? " featured" : "")} key={t.name} style={{ transitionDelay: i * 80 + "ms" }}>
              {t.featured && <span className="badge-pop">Most popular</span>}
              <div className="tname">{t.name}</div>
              <div className="tprice">{t.price}{t.per && <span className="per">{t.per}</span>}</div>
              <div className="tlimit">{t.limit}</div>
              <ul>{t.feats.map((f) => <li key={f}><span className="tk"><IconTick size={16} /></span>{f}</li>)}</ul>
              <a className={"btn " + (t.featured ? "btn-primary" : "btn-ghost")} href="#quote">{t.cta} {t.featured && <Arrow />}</a>
            </div>
          )}
        </div>
        <div className="tiers-note">All plans billed annually. Free 3-month pilot available for anchor accounts.</div>
      </div>
    </section>);

}

function Quote() {
  const [sent, setSent] = useState(false);
  const submit = (e) => {e.preventDefault();setSent(true);};
  return (
    <section className="quote" id="quote">
      <div className="wrap">
        <div className="quote-card reveal">
          <div className="quote-left">
            <span className="eyebrow">Get a quote</span>
            <h2>See your plots assessed.</h2>
            <p>Send a sample of your sourcing geodata and we'll return a PASS / FAIL assessment plus a fixed annual quote — usually within one business day.</p>
            <ul className="quote-points">
              <li><span className="tick"><IconTick /></span> Fixed pricing scaled to your plot volume</li>
              <li><span className="tick"><IconTick /></span> Live in under a week, no GIS team</li>
              <li><span className="tick"><IconTick /></span> Free 3-month pilot for anchor accounts</li>
            </ul>
          </div>
          {sent ?
          <div className="quote-form">
              <div className="quote-sent">
                <div className="big"><IconTick size={26} /></div>
                <h3>Request received.</h3>
                <p>We'll be in touch within one business day with a quote and a sample assessment over your plots.</p>
              </div>
            </div> :

          <form className="quote-form" onSubmit={submit}>
              <div className="field"><label>Work email</label><input type="email" required placeholder="you@forestry.com" /></div>
              <div className="field"><label>Organization</label><input type="text" required placeholder="Pacific Timber Co." /></div>
              <div className="field">
                <div className="row">
                  <div className="field" style={{ gap: 6 }}>
                    <label>Org type</label>
                    <select defaultValue=""><option value="" disabled>Select…</option><option>Forestry exporter</option><option>Mill / producer</option><option>Government agency</option><option>Land trust / NGO</option></select>
                  </div>
                  <div className="field" style={{ gap: 6 }}>
                    <label>Annual plots</label>
                    <select defaultValue=""><option value="" disabled>Select…</option><option>Under 50</option><option>50 – 500</option><option>500+</option><option>Not sure yet</option></select>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" type="submit">Request my quote <Arrow /></button>
              <div className="quote-note">No sales call required to see pricing.</div>
            </form>
          }
        </div>
      </div>
    </section>);

}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <a className="brand" href="#top"><span className="brand-mark"><LeafMark /></span> ClearCanopy</a>
          <p className="tag">Compliant sourcing, verified.</p>
          <div className="footer-rooted">Rooted in the Pacific Northwest</div>
        </div>
        <nav className="footer-links">
          <a href="#how">How it works</a>
          <a href="#monitor">Plot assessment</a>
          <a href="#pricing">Pricing</a>
          <a href="#quote">Get a quote</a>
        </nav>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 ClearCanopy Compliance, Inc.</span>
        <span>Langford, BC, Canada
</span>
      </div>
    </footer>);
}

// ---- glyphs (Garry oak leaf — PNW native) ----
const OAK_LEAF_PATH = "M 16.00 3.60 C 16.86 3.60 18.01 3.82 18.57 3.93 C 19.14 4.04 19.19 4.15 19.40 4.26 C 19.61 4.37 19.73 4.48 19.83 4.59 C 19.93 4.70 19.97 4.81 19.98 4.92 C 19.99 5.03 19.95 5.14 19.90 5.25 C 19.84 5.36 19.74 5.47 19.64 5.58 C 19.53 5.69 19.39 5.80 19.25 5.91 C 19.11 6.02 18.95 6.13 18.81 6.24 C 18.66 6.35 18.50 6.46 18.39 6.57 C 18.28 6.68 18.11 6.79 18.14 6.90 C 18.17 7.01 18.39 7.12 18.58 7.23 C 18.77 7.34 19.02 7.45 19.27 7.56 C 19.53 7.67 19.82 7.78 20.11 7.89 C 20.40 8.00 20.72 8.11 21.02 8.22 C 21.33 8.33 21.64 8.44 21.94 8.55 C 22.24 8.66 22.54 8.77 22.81 8.88 C 23.08 8.99 23.34 9.10 23.57 9.21 C 23.80 9.32 24.01 9.43 24.18 9.54 C 24.34 9.65 24.49 9.76 24.59 9.87 C 24.69 9.98 24.76 10.09 24.78 10.20 C 24.81 10.31 24.79 10.42 24.74 10.53 C 24.69 10.64 24.60 10.75 24.47 10.86 C 24.35 10.97 24.18 11.08 23.99 11.19 C 23.80 11.30 23.57 11.41 23.33 11.52 C 23.08 11.63 22.80 11.74 22.52 11.85 C 22.24 11.96 21.93 12.07 21.63 12.18 C 21.33 12.29 21.01 12.40 20.72 12.51 C 20.42 12.62 20.12 12.73 19.85 12.84 C 19.58 12.95 19.31 13.06 19.11 13.17 C 18.92 13.28 18.67 13.39 18.67 13.50 C 18.66 13.61 18.90 13.72 19.08 13.83 C 19.26 13.94 19.51 14.05 19.76 14.16 C 20.01 14.27 20.29 14.38 20.55 14.49 C 20.82 14.60 21.11 14.71 21.38 14.82 C 21.64 14.93 21.91 15.04 22.16 15.15 C 22.40 15.26 22.63 15.37 22.83 15.48 C 23.04 15.59 23.22 15.70 23.37 15.81 C 23.51 15.92 23.64 16.03 23.72 16.14 C 23.80 16.25 23.85 16.36 23.87 16.47 C 23.88 16.58 23.86 16.69 23.81 16.80 C 23.76 16.91 23.66 17.02 23.55 17.13 C 23.43 17.24 23.27 17.35 23.09 17.46 C 22.92 17.57 22.71 17.68 22.49 17.79 C 22.26 17.90 22.02 18.01 21.76 18.12 C 21.51 18.23 21.23 18.34 20.96 18.45 C 20.69 18.56 20.41 18.67 20.14 18.78 C 19.87 18.89 19.59 19.00 19.34 19.11 C 19.09 19.22 18.84 19.33 18.62 19.44 C 18.41 19.55 18.20 19.66 18.04 19.77 C 17.88 19.88 17.70 19.99 17.67 20.10 C 17.63 20.21 17.75 20.32 17.83 20.43 C 17.90 20.54 18.02 20.65 18.11 20.76 C 18.21 20.87 18.32 20.98 18.40 21.09 C 18.49 21.20 18.57 21.31 18.63 21.42 C 18.69 21.53 18.74 21.64 18.76 21.75 C 18.77 21.86 18.77 21.97 18.74 22.08 C 18.71 22.19 18.65 22.30 18.55 22.41 C 18.46 22.52 18.34 22.63 18.17 22.74 C 18.00 22.85 17.89 22.96 17.53 23.07 C 17.16 23.18 16.19 23.14 16.00 23.40 C 15.81 23.66 16.40 23.43 16.40 24.60 C 16.40 25.77 16.13 30.40 16.00 30.40 C 15.87 30.40 15.85 25.82 15.60 24.60 C 15.35 23.38 14.77 23.38 14.47 23.07 C 14.18 22.76 14.00 22.85 13.83 22.74 C 13.66 22.63 13.54 22.52 13.45 22.41 C 13.35 22.30 13.29 22.19 13.26 22.08 C 13.23 21.97 13.23 21.86 13.24 21.75 C 13.26 21.64 13.31 21.53 13.37 21.42 C 13.43 21.31 13.51 21.20 13.60 21.09 C 13.68 20.98 13.79 20.87 13.89 20.76 C 13.98 20.65 14.10 20.54 14.17 20.43 C 14.25 20.32 14.37 20.21 14.33 20.10 C 14.30 19.99 14.12 19.88 13.96 19.77 C 13.80 19.66 13.59 19.55 13.38 19.44 C 13.16 19.33 12.91 19.22 12.66 19.11 C 12.41 19.00 12.13 18.89 11.86 18.78 C 11.59 18.67 11.31 18.56 11.04 18.45 C 10.77 18.34 10.49 18.23 10.24 18.12 C 9.98 18.01 9.74 17.90 9.51 17.79 C 9.29 17.68 9.08 17.57 8.91 17.46 C 8.73 17.35 8.57 17.24 8.45 17.13 C 8.34 17.02 8.24 16.91 8.19 16.80 C 8.14 16.69 8.12 16.58 8.13 16.47 C 8.15 16.36 8.20 16.25 8.28 16.14 C 8.36 16.03 8.49 15.92 8.63 15.81 C 8.78 15.70 8.96 15.59 9.17 15.48 C 9.37 15.37 9.60 15.26 9.84 15.15 C 10.09 15.04 10.36 14.93 10.62 14.82 C 10.89 14.71 11.18 14.60 11.45 14.49 C 11.71 14.38 11.99 14.27 12.24 14.16 C 12.49 14.05 12.74 13.94 12.92 13.83 C 13.10 13.72 13.34 13.61 13.33 13.50 C 13.33 13.39 13.08 13.28 12.89 13.17 C 12.69 13.06 12.42 12.95 12.15 12.84 C 11.88 12.73 11.58 12.62 11.28 12.51 C 10.99 12.40 10.67 12.29 10.37 12.18 C 10.07 12.07 9.76 11.96 9.48 11.85 C 9.20 11.74 8.92 11.63 8.67 11.52 C 8.43 11.41 8.20 11.30 8.01 11.19 C 7.82 11.08 7.65 10.97 7.53 10.86 C 7.40 10.75 7.31 10.64 7.26 10.53 C 7.21 10.42 7.19 10.31 7.22 10.20 C 7.24 10.09 7.31 9.98 7.41 9.87 C 7.51 9.76 7.66 9.65 7.82 9.54 C 7.99 9.43 8.20 9.32 8.43 9.21 C 8.66 9.10 8.92 8.99 9.19 8.88 C 9.46 8.77 9.76 8.66 10.06 8.55 C 10.36 8.44 10.67 8.33 10.98 8.22 C 11.28 8.11 11.60 8.00 11.89 7.89 C 12.18 7.78 12.47 7.67 12.73 7.56 C 12.98 7.45 13.23 7.34 13.42 7.23 C 13.61 7.12 13.83 7.01 13.86 6.90 C 13.89 6.79 13.72 6.68 13.61 6.57 C 13.50 6.46 13.34 6.35 13.19 6.24 C 13.05 6.13 12.89 6.02 12.75 5.91 C 12.61 5.80 12.47 5.69 12.36 5.58 C 12.26 5.47 12.16 5.36 12.10 5.25 C 12.05 5.14 12.01 5.03 12.02 4.92 C 12.03 4.81 12.07 4.70 12.17 4.59 C 12.27 4.48 12.39 4.37 12.60 4.26 C 12.81 4.15 12.86 4.04 13.43 3.93 C 13.99 3.82 15.14 3.60 16.00 3.60 Z";
const OAK_VEINS = "M 16 23.4 L 16 5.6 M 16 11.6 L 22.6 9.9 M 16 11.6 L 9.4 9.9 M 16 17.6 L 22.0 16.4 M 16 17.6 L 10.0 16.4";

function LeafMark({ size = 28 }) {
  return (
    <span className="oakmark" style={{ width: size, height: size }} aria-hidden="true">
      <img src={window.__resources && window.__resources.oakImg || "assets/garry-oak-stylized.png"} alt="" />
    </span>);

}
function Arrow() {return <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;}function IconTick({ size = 18 }) {return <svg width={size} height={size} viewBox="0 0 20 20" fill="none"><path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;}
function IconUpload() {return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 15V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 15v3a2 2 0 002 2h10a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;}
function IconScan() {return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 12h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;}
function IconReport() {return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14a0 0 0 01 0 0H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M13 3v5h5M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;}
function IconWarn({ size = 20 }) {return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3.4 1.9 20.6h20.2z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 9.6v4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="17.4" r="1" fill="currentColor" /></svg>;}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useReveal();
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    const p = PALETTES[t.palette] || PALETTES["Pine & signal"];
    root.style.setProperty("--moss", p.moss);
    root.style.setProperty("--moss-deep", p.mossDeep);
    if (!t.dark) {
      root.style.setProperty("--forest", p.forest);
      root.style.setProperty("--forest-2", p.forest2);
      root.style.setProperty("--moss-tint", p.mossTint);
    } else {
      root.style.removeProperty("--forest");
      root.style.removeProperty("--forest-2");
    }
    const f = FONT_PAIRS[t.font] || FONT_PAIRS["Schibsted Grotesk"];
    root.style.setProperty("--font-display", f.disp);
    root.style.setProperty("--font-body", f.body);
  }, [t]);

  return (
    <React.Fragment>
      <Nav />
      <Hero headlineA={t.headlineA} headlineB={t.headlineB} />
      <Protect />
      <Problem />
      <How />
      <Monitor />
      <Sources />
      <Cost />
      <Pricing />
      <Quote />
      <Footer />

      <TweaksPanel>
        <TweakSection label="Message" />
        <TweakText label="Headline" value={t.headlineA} onChange={(v) => setTweak("headlineA", v)} />
        <TweakText label="Accent line" value={t.headlineB} onChange={(v) => setTweak("headlineB", v)} />
        <TweakSection label="Palette" />
        <TweakRadio label="Color" value={t.palette} options={Object.keys(PALETTES)} onChange={(v) => setTweak("palette", v)} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakSection label="Type" />
        <TweakSelect label="Font" value={t.font} options={Object.keys(FONT_PAIRS)} onChange={(v) => setTweak("font", v)} />
      </TweaksPanel>
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);