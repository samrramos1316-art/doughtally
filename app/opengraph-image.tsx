import { ImageResponse } from "next/og";

// The link preview for every page that doesn't have its own: what shows up
// when doughtally.app is pasted into a DM, an email or a social post. The
// numbers are the landing page's worked example (lib/industries/examples.ts).
export const alt = "DoughTally: butter up 29.8% takes a wholesale croissant's margin from 36.57% to 32.78%. Fix: charge $2.65.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0c0b09";
const PAPER = "#ece4d6";
const EMBER = "#ff5b1f";
const MUTED = "#8f877b";

export default function Image() {
  const rows: [string, string, string][] = [
    ["Butter per lb", "$3.05", "$3.96"],
    ["Cost of one croissant", "$1.59", "$1.68"],
    ["Margin at $2.50", "36.57%", "32.78%"],
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: INK, color: PAPER, padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#fff" }}>Dough</span>
            <span style={{ color: EMBER }}>Tally</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.05, color: "#fff", letterSpacing: -2 }}>
              Know what every product really costs you.
            </div>
            <div style={{ marginTop: 24, fontSize: 26, lineHeight: 1.35, color: "#b5ad9f" }}>
              Snap a supplier invoice. See which margins it just ate, and what to charge instead.
            </div>
          </div>
          <div style={{ fontSize: 20, color: MUTED, letterSpacing: 2 }}>DOUGHTALLY.APP · FREE DURING EARLY ACCESS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: "auto", width: 470, alignSelf: "center", background: "#14120f", border: "1px solid #2a2620", borderRadius: 12, padding: 32 }}>
          <div style={{ fontSize: 18, color: MUTED, letterSpacing: 2 }}>EXAMPLE · BUTTER SWT UNSLTD 36/1#</div>
          <div style={{ marginTop: 14, fontSize: 21, color: PAPER, display: "flex" }}>
            <span>Butter up</span>
            <span style={{ color: EMBER, marginLeft: 10, marginRight: 10 }}>29.8%</span>
            <span>→ wholesale croissant</span>
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 15, color: "#6d665c", letterSpacing: 2 }}>
            <span style={{ flex: 1 }} />
            <span style={{ width: 100, textAlign: "right" }}>BEFORE</span>
            <span style={{ width: 100, textAlign: "right" }}>AFTER</span>
          </div>
          {rows.map(([k, a, b]) => (
            <div key={k} style={{ display: "flex", padding: "12px 0", borderTop: "1px solid #24211c", fontSize: 22 }}>
              <span style={{ flex: 1 }}>{k}</span>
              <span style={{ width: 100, textAlign: "right", color: "#a79f92" }}>{a}</span>
              <span style={{ width: 100, textAlign: "right", color: "#fff" }}>{b}</span>
            </div>
          ))}
          <div style={{ marginTop: 18, padding: "12px 16px", background: "rgba(255,91,31,0.12)", color: "#ffb08a", fontSize: 20, borderRadius: 4 }}>
            Fix: charge $2.65 to keep 36.57%
          </div>
        </div>
      </div>
    ),
    size,
  );
}
