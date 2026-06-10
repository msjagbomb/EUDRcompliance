// mapdemo.jsx — EUDR plot assessment view
// A procedural NDVI canopy base with the user's sourcing plots overlaid as
// polygons, each assessed PASS / FAIL against the illegal land-conversion
// database (post-Dec-2020 clearings shown as bare scars). A scan line sweeps
// to convey live assessment; the register stays in sync with the map.

const { useRef, useEffect, useState, useCallback } = React;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function buildNoise(seed) {
  const rnd = mulberry32(seed);
  const G = 64;
  const grid = new Float32Array(G * G);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  const sm = (t) => t * t * (3 - 2 * t);
  const at = (x, y) => {
    x = ((x % G) + G) % G; y = ((y % G) + G) % G;
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    const fx = sm(x - x0), fy = sm(y - y0);
    const a = grid[y0 * G + x0], b = grid[y0 * G + x1];
    const c = grid[y1 * G + x0], d = grid[y1 * G + x1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
  };
  return (x, y) => {
    let v = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++) { v += at(x * f, y * f) * amp; amp *= 0.5; f *= 2; }
    return v;
  };
}
function vegColor(v) {
  if (v < 0.34) { const t = v / 0.34; return [28 + t * 10, 52 + t * 22, 74 + t * 26]; }
  if (v < 0.42) { const t = (v - 0.34) / 0.08; return [150 - t * 20, 140 - t * 4, 92 - t * 8]; }
  const t = (v - 0.42) / 0.58;
  return [168 - t * 120, 175 - t * 80, 78 - t * 38];
}

// user's sourcing plots (normalized rect polygons over the canvas)
const PLOTS = [
  { id: "p1", verdict: "pass", x: 0.205, y: 0.27, w: 0.15, h: 0.13, place: "Coastal Block A-12", lat: "51.284", lng: "-127.612", area: "142" },
  { id: "p2", verdict: "fail", x: 0.56, y: 0.20, w: 0.165, h: 0.135, place: "Aspen Flats Lot 7", lat: "51.611", lng: "-126.904", area: "318", year: "2022" },
  { id: "p3", verdict: "pass", x: 0.39, y: 0.56, w: 0.14, h: 0.12, place: "Tannock Ridge B-3", lat: "50.972", lng: "-127.188", area: "96" },
  { id: "p4", verdict: "fail", x: 0.71, y: 0.585, w: 0.15, h: 0.13, place: "Eastbank Parcel 19", lat: "50.844", lng: "-126.530", area: "254", year: "2021" },
  { id: "p5", verdict: "pass", x: 0.15, y: 0.64, w: 0.13, h: 0.12, place: "Sulik Watershed C-1", lat: "50.701", lng: "-127.901", area: "178" },
];

function PlotAssessment() {
  const canvasRef = useRef(null);
  const noiseRef = useRef(buildNoise(20251230));
  const [layers, setLayers] = useState({ ndvi: true, conversions: true, plots: true });
  const [selected, setSelected] = useState("p2");
  const [assessed, setAssessed] = useState(4);
  const [fresh, setFresh] = useState(null);
  const [scanX, setScanX] = useState(0);

  const draw = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const noise = noiseRef.current;
    const img = ctx.createImageData(W, H);
    const data = img.data;
    const scale = 4.2;
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        let v = noise((px / W) * scale, (py / H) * scale * 0.78);
        v = Math.pow(v, 1.15);
        let [r, g, b] = layers.ndvi ? vegColor(v) : grayShade(v);
        const i = (py * W + px) * 4;
        data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // conversion scars inside FAIL plots
    if (layers.conversions) {
      PLOTS.forEach((p, idx) => {
        if (idx >= assessed || p.verdict !== "fail") return;
        const cx = (p.x + p.w * 0.55) * W, cy = (p.y + p.h * 0.5) * H;
        const w = p.w * 0.62 * W, h = p.h * 0.6 * H;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((idx % 3) * 0.1 - 0.1);
        const grad = ctx.createLinearGradient(-w, -h, w, h);
        grad.addColorStop(0, "rgba(176,138,96,0.96)");
        grad.addColorStop(1, "rgba(150,108,72,0.96)");
        ctx.fillStyle = grad;
        roundRectPath(ctx, -w / 2, -h / 2, w, h, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(96,70,46,0.5)";
        for (let s = 0; s < 16; s++) ctx.fillRect((Math.sin(s * 12.9 + idx) * 0.5) * w, (Math.cos(s * 7.3 + idx) * 0.5) * h, 1.6, 1.6);
        ctx.restore();
      });
    }

    // plot boundaries
    if (layers.plots) {
      PLOTS.forEach((p, idx) => {
        if (idx >= assessed) return;
        const x = p.x * W, y = p.y * H, w = p.w * W, h = p.h * H;
        const ok = p.verdict === "pass";
        ctx.save();
        ctx.lineWidth = selected === p.id ? 3 : 2;
        ctx.setLineDash(ok ? [] : [7, 4]);
        ctx.strokeStyle = ok ? "rgba(120,205,150,0.95)" : "rgba(232,112,92,0.97)";
        ctx.fillStyle = ok ? "rgba(120,205,150,0.10)" : "rgba(232,112,92,0.12)";
        roundRectPath(ctx, x, y, w, h, 4);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      });
    }
  }, [layers, assessed, selected]);

  function grayShade(v) { const g = 40 + v * 180; return [g, g, g + 6]; }
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    let raf, start = performance.now();
    const loop = (t) => { setScanX(((t - start) / 5200) % 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const tm = setTimeout(() => {
      setAssessed(5); setFresh("p5"); setSelected("p5");
      setTimeout(() => setFresh(null), 800);
    }, 4200);
    return () => clearTimeout(tm);
  }, []);

  const toggle = (k) => setLayers((s) => ({ ...s, [k]: !s[k] }));
  const visible = PLOTS.slice(0, assessed);
  const fails = visible.filter((p) => p.verdict === "fail").length;
  const passes = visible.length - fails;

  return (
    <div className="mapdemo">
      <div className="md-chrome">
        <div className="md-title"><LeafGlyph size={15} /> Plot Assessment — EUDR Due Diligence</div>
        <div className="md-chips">
          <span className={"md-chip" + (layers.ndvi ? " on" : "")} onClick={() => toggle("ndvi")}>NDVI</span>
          <span className={"md-chip" + (layers.conversions ? " on" : "")} onClick={() => toggle("conversions")}>Conversions</span>
          <span className={"md-chip" + (layers.plots ? " on" : "")} onClick={() => toggle("plots")}>Plots</span>
        </div>
        <div className="md-live"><span className="live-dot"></span> Assessing</div>
      </div>

      <div className="md-body">
        <div className="md-canvas-wrap">
          <canvas ref={canvasRef} width={640} height={470}></canvas>
          <div className="md-scan" style={{ left: (scanX * 100) + "%" }}></div>

          {layers.plots && visible.map((p) => (
            <div
              key={p.id}
              className={"det " + p.verdict + (selected === p.id ? " sel" : "") + (fresh === p.id ? " fresh" : "")}
              style={{ left: ((p.x + p.w / 2) * 100) + "%", top: ((p.y + p.h / 2) * 100) + "%" }}
              onClick={() => setSelected(p.id)}
            >
              <div className={"vmark " + p.verdict}>{p.verdict === "pass" ? "✓" : "!"}</div>
              <div className="tag">{p.place} · {p.verdict.toUpperCase()}</div>
            </div>
          ))}

          <div className="md-legend">
            <div className="lt"><span className="sw fail"></span> Non-compliant conversion since Dec 2020</div>
            <div className="bar"></div>
            <div className="scale"><span>cleared</span><span>dense canopy</span></div>
          </div>
        </div>

        <div className="md-side">
          <div className="md-side-head">
            <div className="h">Sourcing plots <span className="count">{passes}✓ / {fails}✕</span></div>
            <div className="sub">vs Dec 31 2020 baseline · 10 m</div>
          </div>
          <div className="md-alerts">
            {visible.map((p) => (
              <button key={p.id} className={"md-alert" + (selected === p.id ? " sel" : "")} onClick={() => setSelected(p.id)}>
                <div className="row1">
                  <span className="place">{p.place}{fresh === p.id && <span className="md-newbadge">NEW</span>}</span>
                  <span className={"verdict " + p.verdict}>{p.verdict === "pass" ? "PASS" : "FAIL"}</span>
                </div>
                <div className="coords">{p.lat}°N, {p.lng}°W · {p.area} ha</div>
                {p.verdict === "fail"
                  ? <div className="row2"><span className="pill area">Conversion detected · {p.year}</span></div>
                  : <div className="row2"><span className="pill conf">No conversion in boundary</span></div>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// LiveAppEmbed — frames the ClearCanopy app, now distributed via the Microsoft Store
function LiveAppEmbed({ src = "https://apps.microsoft.com/detail/9MZF5PV1DK71?hl=en-us&gl=CA&ocid=pdpshare" }) {
  return (
    <div className="mapdemo liveapp">
      <div className="md-chrome">
        <div className="md-title"><LeafGlyph size={15} /> ClearCanopy — Desktop App</div>
        <div className="la-url" title={src}>apps.microsoft.com</div>
        <a className="la-open" href={src} target="_blank" rel="noopener noreferrer">
          Open listing
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3H3.5A1.5 1.5 0 002 4.5v8A1.5 1.5 0 003.5 14h8a1.5 1.5 0 001.5-1.5V10M9.5 2.5H13.5V6.5M13 3L7.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>
      <div className="la-body la-store">
        <div className="la-store-card">
          <div className="la-store-icon"><span className="la-store-mono">CC</span></div>
          <div className="la-store-name">ClearCanopy</div>
          <div className="la-store-sub">EUDR due diligence for forestry — now a native Windows app.</div>
          <a className="la-store-btn" href={src} target="_blank" rel="noopener noreferrer">
            <span className="la-win-glyph" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </span>
            <span className="la-store-btn-text">
              <small>Get it from</small>
              <strong>Microsoft Store</strong>
            </span>
          </a>
          <div className="la-store-meta">Free download · Windows 10 &amp; 11</div>
        </div>
      </div>
    </div>
  );
}

function LeafGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M 16.00 3.60 C 16.86 3.60 18.01 3.82 18.57 3.93 C 19.14 4.04 19.19 4.15 19.40 4.26 C 19.61 4.37 19.73 4.48 19.83 4.59 C 19.93 4.70 19.97 4.81 19.98 4.92 C 19.99 5.03 19.95 5.14 19.90 5.25 C 19.84 5.36 19.74 5.47 19.64 5.58 C 19.53 5.69 19.39 5.80 19.25 5.91 C 19.11 6.02 18.95 6.13 18.81 6.24 C 18.66 6.35 18.50 6.46 18.39 6.57 C 18.28 6.68 18.11 6.79 18.14 6.90 C 18.17 7.01 18.39 7.12 18.58 7.23 C 18.77 7.34 19.02 7.45 19.27 7.56 C 19.53 7.67 19.82 7.78 20.11 7.89 C 20.40 8.00 20.72 8.11 21.02 8.22 C 21.33 8.33 21.64 8.44 21.94 8.55 C 22.24 8.66 22.54 8.77 22.81 8.88 C 23.08 8.99 23.34 9.10 23.57 9.21 C 23.80 9.32 24.01 9.43 24.18 9.54 C 24.34 9.65 24.49 9.76 24.59 9.87 C 24.69 9.98 24.76 10.09 24.78 10.20 C 24.81 10.31 24.79 10.42 24.74 10.53 C 24.69 10.64 24.60 10.75 24.47 10.86 C 24.35 10.97 24.18 11.08 23.99 11.19 C 23.80 11.30 23.57 11.41 23.33 11.52 C 23.08 11.63 22.80 11.74 22.52 11.85 C 22.24 11.96 21.93 12.07 21.63 12.18 C 21.33 12.29 21.01 12.40 20.72 12.51 C 20.42 12.62 20.12 12.73 19.85 12.84 C 19.58 12.95 19.31 13.06 19.11 13.17 C 18.92 13.28 18.67 13.39 18.67 13.50 C 18.66 13.61 18.90 13.72 19.08 13.83 C 19.26 13.94 19.51 14.05 19.76 14.16 C 20.01 14.27 20.29 14.38 20.55 14.49 C 20.82 14.60 21.11 14.71 21.38 14.82 C 21.64 14.93 21.91 15.04 22.16 15.15 C 22.40 15.26 22.63 15.37 22.83 15.48 C 23.04 15.59 23.22 15.70 23.37 15.81 C 23.51 15.92 23.64 16.03 23.72 16.14 C 23.80 16.25 23.85 16.36 23.87 16.47 C 23.88 16.58 23.86 16.69 23.81 16.80 C 23.76 16.91 23.66 17.02 23.55 17.13 C 23.43 17.24 23.27 17.35 23.09 17.46 C 22.92 17.57 22.71 17.68 22.49 17.79 C 22.26 17.90 22.02 18.01 21.76 18.12 C 21.51 18.23 21.23 18.34 20.96 18.45 C 20.69 18.56 20.41 18.67 20.14 18.78 C 19.87 18.89 19.59 19.00 19.34 19.11 C 19.09 19.22 18.84 19.33 18.62 19.44 C 18.41 19.55 18.20 19.66 18.04 19.77 C 17.88 19.88 17.70 19.99 17.67 20.10 C 17.63 20.21 17.75 20.32 17.83 20.43 C 17.90 20.54 18.02 20.65 18.11 20.76 C 18.21 20.87 18.32 20.98 18.40 21.09 C 18.49 21.20 18.57 21.31 18.63 21.42 C 18.69 21.53 18.74 21.64 18.76 21.75 C 18.77 21.86 18.77 21.97 18.74 22.08 C 18.71 22.19 18.65 22.30 18.55 22.41 C 18.46 22.52 18.34 22.63 18.17 22.74 C 18.00 22.85 17.89 22.96 17.53 23.07 C 17.16 23.18 16.19 23.14 16.00 23.40 C 15.81 23.66 16.40 23.43 16.40 24.60 C 16.40 25.77 16.13 30.40 16.00 30.40 C 15.87 30.40 15.85 25.82 15.60 24.60 C 15.35 23.38 14.77 23.38 14.47 23.07 C 14.18 22.76 14.00 22.85 13.83 22.74 C 13.66 22.63 13.54 22.52 13.45 22.41 C 13.35 22.30 13.29 22.19 13.26 22.08 C 13.23 21.97 13.23 21.86 13.24 21.75 C 13.26 21.64 13.31 21.53 13.37 21.42 C 13.43 21.31 13.51 21.20 13.60 21.09 C 13.68 20.98 13.79 20.87 13.89 20.76 C 13.98 20.65 14.10 20.54 14.17 20.43 C 14.25 20.32 14.37 20.21 14.33 20.10 C 14.30 19.99 14.12 19.88 13.96 19.77 C 13.80 19.66 13.59 19.55 13.38 19.44 C 13.16 19.33 12.91 19.22 12.66 19.11 C 12.41 19.00 12.13 18.89 11.86 18.78 C 11.59 18.67 11.31 18.56 11.04 18.45 C 10.77 18.34 10.49 18.23 10.24 18.12 C 9.98 18.01 9.74 17.90 9.51 17.79 C 9.29 17.68 9.08 17.57 8.91 17.46 C 8.73 17.35 8.57 17.24 8.45 17.13 C 8.34 17.02 8.24 16.91 8.19 16.80 C 8.14 16.69 8.12 16.58 8.13 16.47 C 8.15 16.36 8.20 16.25 8.28 16.14 C 8.36 16.03 8.49 15.92 8.63 15.81 C 8.78 15.70 8.96 15.59 9.17 15.48 C 9.37 15.37 9.60 15.26 9.84 15.15 C 10.09 15.04 10.36 14.93 10.62 14.82 C 10.89 14.71 11.18 14.60 11.45 14.49 C 11.71 14.38 11.99 14.27 12.24 14.16 C 12.49 14.05 12.74 13.94 12.92 13.83 C 13.10 13.72 13.34 13.61 13.33 13.50 C 13.33 13.39 13.08 13.28 12.89 13.17 C 12.69 13.06 12.42 12.95 12.15 12.84 C 11.88 12.73 11.58 12.62 11.28 12.51 C 10.99 12.40 10.67 12.29 10.37 12.18 C 10.07 12.07 9.76 11.96 9.48 11.85 C 9.20 11.74 8.92 11.63 8.67 11.52 C 8.43 11.41 8.20 11.30 8.01 11.19 C 7.82 11.08 7.65 10.97 7.53 10.86 C 7.40 10.75 7.31 10.64 7.26 10.53 C 7.21 10.42 7.19 10.31 7.22 10.20 C 7.24 10.09 7.31 9.98 7.41 9.87 C 7.51 9.76 7.66 9.65 7.82 9.54 C 7.99 9.43 8.20 9.32 8.43 9.21 C 8.66 9.10 8.92 8.99 9.19 8.88 C 9.46 8.77 9.76 8.66 10.06 8.55 C 10.36 8.44 10.67 8.33 10.98 8.22 C 11.28 8.11 11.60 8.00 11.89 7.89 C 12.18 7.78 12.47 7.67 12.73 7.56 C 12.98 7.45 13.23 7.34 13.42 7.23 C 13.61 7.12 13.83 7.01 13.86 6.90 C 13.89 6.79 13.72 6.68 13.61 6.57 C 13.50 6.46 13.34 6.35 13.19 6.24 C 13.05 6.13 12.89 6.02 12.75 5.91 C 12.61 5.80 12.47 5.69 12.36 5.58 C 12.26 5.47 12.16 5.36 12.10 5.25 C 12.05 5.14 12.01 5.03 12.02 4.92 C 12.03 4.81 12.07 4.70 12.17 4.59 C 12.27 4.48 12.39 4.37 12.60 4.26 C 12.81 4.15 12.86 4.04 13.43 3.93 C 13.99 3.82 15.14 3.60 16.00 3.60 Z" />
    </svg>
  );
}

window.PlotAssessment = PlotAssessment;
window.CanopyMap = PlotAssessment; // back-compat
window.LiveAppEmbed = LiveAppEmbed;
window.LeafGlyph = LeafGlyph;
