import { useState, useMemo } from "react";

const SCHOOLS_DATA = [
  { name: "Georgia Tech", fullName: "Georgia Institute of Technology", tam: 62118, enrollment: 47318, staff: 14800, score: 87, tier: 1, age: 3, state: "GA", conf: "Out-of-State", type: "Public R1", income: 75000, size: 82.9, growth: 100.0, need: 71.6, fresh: 95.9, enrollTrend: [42200, 41500, 43100, 44200, 45800, 47318] },
  { name: "UC Davis", fullName: "UC Davis", tam: 66418, enrollment: 42807, staff: 23611, score: 82, tier: 1, age: 5, state: "CA", conf: "UC System", type: "Public R1", income: 78000, size: 89.1, growth: 68.6, need: 67.9, fresh: 93.2, enrollTrend: [39500, 38200, 39800, 41000, 42100, 42807] },
  { name: "UC San Diego", fullName: "UC San Diego", tam: 64890, enrollment: 43968, staff: 20922, score: 77, tier: 1, age: 4, state: "CA", conf: "UC System", type: "Public R1", income: 85000, size: 86.9, growth: 55.4, need: 59.3, fresh: 94.5, enrollTrend: [40100, 39000, 40500, 42100, 43500, 43968] },
  { name: "UT Arlington", fullName: "University of Texas at Arlington", tam: 50042, enrollment: 41573, staff: 8469, score: 74, tier: 1, age: 0, state: "TX", conf: "Out-of-State", type: "Public R1", income: 72000, size: 65.6, growth: 65.6, need: 75.3, fresh: 100.0, enrollTrend: [38500, 37200, 38900, 40000, 40900, 41573] },
  { name: "UC Irvine", fullName: "UC Irvine", tam: 56309, enrollment: 37274, staff: 19035, score: 66, tier: 1, age: 6, state: "CA", conf: "UC System", type: "Public R1", income: 82000, size: 74.6, growth: 27.5, need: 63.0, fresh: 91.8, enrollTrend: [35800, 34900, 36100, 37200, 37500, 37274] },
  { name: "Abilene Christian", fullName: "Abilene Christian University", tam: 6868, enrollment: 5423, staff: 1445, score: 56, tier: 2, age: 0, state: "TX", conf: "WAC", type: "Private", income: 52000, size: 3.7, growth: 70.5, need: 100.0, fresh: 100.0, enrollTrend: [5100, 4950, 5050, 5200, 5325, 5423] },
  { name: "UCLA", fullName: "UCLA", tam: 74026, enrollment: 46759, staff: 27267, score: 53, tier: 2, age: 73, state: "CA", conf: "Founding", type: "Public R1", income: 82000, size: 100.0, growth: 2.8, need: 63.0, fresh: 0.0, enrollTrend: [45900, 44100, 44800, 46200, 47600, 46759] },
  { name: "LMU", fullName: "Loyola Marymount University", tam: 13994, enrollment: 10573, staff: 3421, score: 46, tier: 2, age: 12, state: "CA", conf: "WCC", type: "Private", income: 82000, size: 13.9, growth: 56.3, need: 63.0, fresh: 83.6, enrollTrend: [9800, 9600, 9900, 10200, 10450, 10573] },
  { name: "Chabot College", fullName: "Chabot College", tam: 15128, enrollment: 13812, staff: 1316, score: 46, tier: 2, age: 10, state: "CA", conf: "CC", type: "Community College", income: 120000, size: 15.6, growth: 96.5, need: 16.0, fresh: 86.3, enrollTrend: [13500, 12600, 12200, 13000, 13400, 13812] },
  { name: "Las Positas", fullName: "Las Positas College", tam: 9898, enrollment: 9062, staff: 836, score: 39, tier: 2, age: 10, state: "CA", conf: "CC", type: "Community College", income: 120000, size: 8.1, growth: 78.1, need: 16.0, fresh: 86.3, enrollTrend: [8800, 8200, 7900, 8500, 8870, 9062] },
  { name: "Saint Mary's", fullName: "Saint Mary's College of California", tam: 5164, enrollment: 3976, staff: 1188, score: 39, tier: 2, age: 0, state: "CA", conf: "WCC", type: "Private", income: 120000, size: 1.3, growth: 76.6, need: 16.0, fresh: 100.0, enrollTrend: [4100, 3950, 3850, 3900, 3890, 3976] },
  { name: "Pepperdine", fullName: "Pepperdine University", tam: 12386, enrollment: 9346, staff: 3040, score: 39, tier: 2, age: 14, state: "CA", conf: "WCC", type: "Private", income: 82000, size: 11.6, growth: 28.0, need: 63.0, fresh: 80.8, enrollTrend: [9200, 8900, 9000, 9200, 9400, 9346] },
  { name: "Santa Clara", fullName: "Santa Clara University", tam: 12769, enrollment: 10042, staff: 2727, score: 31, tier: 3, age: 9, state: "CA", conf: "WCC", type: "Private", income: 133000, size: 12.2, growth: 44.2, need: 0.0, fresh: 87.7, enrollTrend: [9300, 9100, 9400, 9700, 10000, 10042] },
  { name: "Mt. St. Mary's", fullName: "Mount Saint Mary's University", tam: 4269, enrollment: 3309, staff: 960, score: 30, tier: 3, age: 8, state: "CA", conf: "LA Local", type: "Private", income: 82000, size: 0.0, growth: 0.0, need: 63.0, fresh: 89.0, enrollTrend: [3500, 3400, 3350, 3380, 3375, 3309] },
];

const NCUA_DATA = [
  { period: "2019-Q1", members: 38000, assets: 420, loans: 280 },
  { period: "2019-Q3", members: 38500, assets: 425, loans: 283 },
  { period: "2020-Q1", members: 39200, assets: 432, loans: 288 },
  { period: "2020-Q3", members: 39800, assets: 438, loans: 291 },
  { period: "2021-Q1", members: 40500, assets: 446, loans: 296 },
  { period: "2021-Q3", members: 41200, assets: 455, loans: 302 },
  { period: "2022-Q1", members: 41800, assets: 468, loans: 312 },
  { period: "2022-Q3", members: 42500, assets: 482, loans: 325 },
  { period: "2023-Q1", members: 42900, assets: 498, loans: 338 },
  { period: "2023-Q3", members: 43200, assets: 512, loans: 348 },
  { period: "2024-Q1", members: 43800, assets: 528, loans: 360 },
  { period: "2024-Q3", members: 43394, assets: 540, loans: 372 },
];

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024];

const tierConfig = {
  1: { label: "Tier 1: Prioritize", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  2: { label: "Tier 2: Grow", color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
  3: { label: "Tier 3: Maintain", color: "#94A3B8", bg: "#F8FAFC", border: "#E2E8F0" },
};

function MiniSparkline({ data, color, width = 80, height = 28 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2} r="3" fill={color} />
    </svg>
  );
}

function ScoreBar({ value, max = 100, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 60, height: 6, background: "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: "#64748B", fontVariantNumeric: "tabular-nums", minWidth: 24 }}>{Math.round(value)}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", border: "1px solid #E2E8F0", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#1E293B", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [view, setView] = useState("scorecard");

  const filtered = useMemo(() => {
    let data = [...SCHOOLS_DATA];
    if (selectedTier !== "all") data = data.filter(s => s.tier === parseInt(selectedTier));
    data.sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "tam") return b.tam - a.tam;
      if (sortBy === "age") return a.age - b.age;
      return 0;
    });
    return data;
  }, [selectedTier, sortBy]);

  const totalTAM = SCHOOLS_DATA.reduce((s, d) => s + d.tam, 0);
  const currentMembers = 43394;
  const penetration = ((currentMembers / totalTAM) * 100).toFixed(1);
  const tier1TAM = SCHOOLS_DATA.filter(s => s.tier === 1).reduce((s, d) => s + d.tam, 0);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh", color: "#1E293B" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1B365D 0%, #0F2440 100%)", padding: "32px 32px 28px", color: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#94C5F8", marginBottom: 6 }}>
            Credit Union Partnership Growth Strategy
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            UCU Opportunity Scorecard
          </h1>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
            Data Sources: IPEDS · NCUA 5300 Call Reports · U.S. Census Bureau | 2019–2024
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
        {/* KPI Row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <MetricCard label="Total Addressable Market" value={totalTAM.toLocaleString()} sub="Students + Staff across all partners" color="#1B365D" />
          <MetricCard label="Current Members" value={currentMembers.toLocaleString()} sub="As of Q4 2024" color="#0891B2" />
          <MetricCard label="Penetration Rate" value={`${penetration}%`} sub="Massive growth runway" color="#F59E0B" />
          <MetricCard label="Tier 1 TAM" value={tier1TAM.toLocaleString()} sub="Highest priority schools" color="#10B981" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", borderRadius: 10, padding: 4, border: "1px solid #E2E8F0", width: "fit-content" }}>
          {[["scorecard", "Scorecard"], ["growth", "UCU Growth"], ["detail", "School Detail"]].map(([key, label]) => (
            <button key={key} onClick={() => setView(key)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: view === key ? "#1B365D" : "transparent", color: view === key ? "white" : "#64748B",
              transition: "all 0.15s"
            }}>{label}</button>
          ))}
        </div>

        {/* SCORECARD VIEW */}
        {view === "scorecard" && (
          <div>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Filter:</span>
              {[["all", "All Schools"], ["1", "Tier 1"], ["2", "Tier 2"], ["3", "Tier 3"]].map(([val, label]) => (
                <button key={val} onClick={() => setSelectedTier(val)} style={{
                  padding: "6px 14px", borderRadius: 6, border: `1px solid ${selectedTier === val ? "#1B365D" : "#E2E8F0"}`,
                  background: selectedTier === val ? "#1B365D" : "white", color: selectedTier === val ? "white" : "#64748B",
                  cursor: "pointer", fontSize: 12, fontWeight: 500
                }}>{label}</button>
              ))}
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginLeft: 12 }}>Sort:</span>
              {[["score", "Score"], ["tam", "Market Size"], ["age", "Newest First"]].map(([val, label]) => (
                <button key={val} onClick={() => setSortBy(val)} style={{
                  padding: "6px 14px", borderRadius: 6, border: `1px solid ${sortBy === val ? "#0891B2" : "#E2E8F0"}`,
                  background: sortBy === val ? "#ECFEFF" : "white", color: sortBy === val ? "#0891B2" : "#64748B",
                  cursor: "pointer", fontSize: 12, fontWeight: 500
                }}>{label}</button>
              ))}
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>University</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Tier</th>
                    <th style={{ textAlign: "right", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>TAM</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Enrollment Trend</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Size</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Growth</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Need</th>
                    <th style={{ textAlign: "center", padding: "12px 8px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Freshness</th>
                    <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 600, color: "#64748B", fontSize: 11, textTransform: "uppercase" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((school, i) => {
                    const tc = tierConfig[school.tier];
                    return (
                      <tr key={school.name} onClick={() => { setSelectedSchool(school); setView("detail"); }}
                        style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 600, color: "#1E293B" }}>{school.name}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>{school.state} · {school.conf} · {school.age}yr partner</div>
                        </td>
                        <td style={{ textAlign: "center", padding: "14px 8px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                            T{school.tier}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", padding: "14px 8px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                          {school.tam.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "center", padding: "14px 8px" }}>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <MiniSparkline data={school.enrollTrend} color={tc.color} />
                          </div>
                        </td>
                        <td style={{ padding: "14px 8px" }}><ScoreBar value={school.size} color="#1B365D" /></td>
                        <td style={{ padding: "14px 8px" }}><ScoreBar value={school.growth} color="#0891B2" /></td>
                        <td style={{ padding: "14px 8px" }}><ScoreBar value={school.need} color="#F59E0B" /></td>
                        <td style={{ padding: "14px 8px" }}><ScoreBar value={school.fresh} color="#10B981" /></td>
                        <td style={{ textAlign: "center", padding: "14px 16px" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: tc.color }}>{school.score}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scoring methodology */}
            <div style={{ marginTop: 16, padding: "16px 20px", background: "white", borderRadius: 10, border: "1px solid #E2E8F0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Scoring Methodology</div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#64748B" }}>
                <span><strong style={{ color: "#1B365D" }}>Size (40%)</strong> — Addressable population</span>
                <span><strong style={{ color: "#0891B2" }}>Growth (20%)</strong> — Enrollment YoY trend</span>
                <span><strong style={{ color: "#F59E0B" }}>Need (20%)</strong> — Financial need proxy (inverse income)</span>
                <span><strong style={{ color: "#10B981" }}>Freshness (20%)</strong> — Partnership newness (untapped potential)</span>
              </div>
            </div>
          </div>
        )}

        {/* UCU GROWTH VIEW */}
        {view === "growth" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: "#1E293B" }}>UCU Membership Growth (2019–2024)</h3>
              <svg viewBox="0 0 700 250" style={{ width: "100%" }}>
                {NCUA_DATA.map((d, i) => {
                  const x = 60 + (i / (NCUA_DATA.length - 1)) * 600;
                  const minM = 37000, maxM = 45000;
                  const y = 230 - ((d.members - minM) / (maxM - minM)) * 200;
                  const points = NCUA_DATA.map((dd, ii) => {
                    const xx = 60 + (ii / (NCUA_DATA.length - 1)) * 600;
                    const yy = 230 - ((dd.members - minM) / (maxM - minM)) * 200;
                    return `${xx},${yy}`;
                  }).join(" ");
                  return i === 0 ? (
                    <g key="line">
                      <defs>
                        <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1B365D" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#1B365D" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon points={`60,230 ${points} 660,230`} fill="url(#memGrad)" />
                      <polyline points={points} fill="none" stroke="#1B365D" strokeWidth="2.5" strokeLinecap="round" />
                      {NCUA_DATA.map((dd, ii) => {
                        const xx = 60 + (ii / (NCUA_DATA.length - 1)) * 600;
                        const yy = 230 - ((dd.members - minM) / (maxM - minM)) * 200;
                        return <g key={ii}>
                          <circle cx={xx} cy={yy} r="4" fill="#1B365D" />
                          {ii % 2 === 0 && <text x={xx} y={245} textAnchor="middle" fontSize="10" fill="#94A3B8">{dd.period}</text>}
                          <text x={xx} y={yy - 10} textAnchor="middle" fontSize="9" fill="#64748B" fontWeight="600">{(dd.members / 1000).toFixed(1)}K</text>
                        </g>;
                      })}
                      {[37000, 39000, 41000, 43000, 45000].map(v => {
                        const gy = 230 - ((v - minM) / (maxM - minM)) * 200;
                        return <g key={v}>
                          <line x1="55" y1={gy} x2="665" y2={gy} stroke="#E2E8F0" strokeDasharray="4" />
                          <text x="50" y={gy + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{(v/1000)}K</text>
                        </g>;
                      })}
                    </g>
                  ) : null;
                })}
              </svg>
            </div>

            {/* Penetration gap */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>The Growth Opportunity</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 32, background: "#E2E8F0", borderRadius: 8, overflow: "hidden", position: "relative" }}>
                    <div style={{ width: `${penetration}%`, height: "100%", background: "linear-gradient(90deg, #1B365D, #0891B2)", borderRadius: 8 }} />
                    <div style={{ position: "absolute", left: `${penetration}%`, top: -4, width: 2, height: 40, background: "#EF4444" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12 }}>
                    <span style={{ color: "#1B365D", fontWeight: 700 }}>{currentMembers.toLocaleString()} members</span>
                    <span style={{ color: "#F59E0B", fontWeight: 700 }}>{(totalTAM - currentMembers).toLocaleString()} untapped</span>
                  </div>
                </div>
                <div style={{ textAlign: "center", padding: "12px 20px", background: "#FEF3C7", borderRadius: 10 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F59E0B" }}>{penetration}%</div>
                  <div style={{ fontSize: 11, color: "#92400E" }}>Current Penetration</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 16, lineHeight: 1.6 }}>
                A 5-point penetration increase (to ~{(parseFloat(penetration) + 5).toFixed(0)}%) would add approximately <strong style={{ color: "#1E293B" }}>{Math.round(totalTAM * 0.05).toLocaleString()} new member-owners</strong>, translating to significant deposit growth, loan originations, and community impact.
              </p>
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {SCHOOLS_DATA.sort((a, b) => b.score - a.score).map(s => (
                <button key={s.name} onClick={() => setSelectedSchool(s)} style={{
                  padding: "6px 12px", borderRadius: 8, border: `1px solid ${selectedSchool?.name === s.name ? tierConfig[s.tier].color : "#E2E8F0"}`,
                  background: selectedSchool?.name === s.name ? tierConfig[s.tier].bg : "white",
                  color: selectedSchool?.name === s.name ? tierConfig[s.tier].color : "#64748B",
                  cursor: "pointer", fontSize: 12, fontWeight: 500
                }}>{s.name}</button>
              ))}
            </div>

            {selectedSchool ? (
              <div style={{ background: "white", borderRadius: 12, border: "1px solid #E2E8F0", padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{selectedSchool.fullName}</h2>
                    <p style={{ fontSize: 13, color: "#64748B", margin: "4px 0 0" }}>
                      {selectedSchool.state} · {selectedSchool.conf} · {selectedSchool.type} · Partner since {2024 - selectedSchool.age}
                    </p>
                  </div>
                  <div style={{ textAlign: "center", padding: "8px 16px", background: tierConfig[selectedSchool.tier].bg, borderRadius: 10, border: `1px solid ${tierConfig[selectedSchool.tier].border}` }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: tierConfig[selectedSchool.tier].color }}>{selectedSchool.score}</div>
                    <div style={{ fontSize: 10, color: tierConfig[selectedSchool.tier].color, fontWeight: 600 }}>{tierConfig[selectedSchool.tier].label}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                  {[
                    { label: "Addressable Pop.", value: selectedSchool.tam.toLocaleString(), color: "#1B365D" },
                    { label: "Enrollment", value: selectedSchool.enrollment.toLocaleString(), color: "#0891B2" },
                    { label: "Staff", value: selectedSchool.staff.toLocaleString(), color: "#10B981" },
                    { label: "Median Income", value: `$${(selectedSchool.income / 1000).toFixed(0)}K`, color: "#F59E0B" },
                  ].map(m => (
                    <div key={m.label} style={{ padding: 14, background: "#F8FAFC", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>Score Breakdown</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                  {[
                    { label: "Market Size", value: selectedSchool.size, weight: "40%", color: "#1B365D" },
                    { label: "Growth Momentum", value: selectedSchool.growth, weight: "20%", color: "#0891B2" },
                    { label: "Financial Need", value: selectedSchool.need, weight: "20%", color: "#F59E0B" },
                    { label: "Partnership Freshness", value: selectedSchool.fresh, weight: "20%", color: "#10B981" },
                  ].map(comp => (
                    <div key={comp.label} style={{ textAlign: "center" }}>
                      <div style={{ width: 72, height: 72, borderRadius: "50%", border: `4px solid ${comp.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", background: "white" }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: comp.color }}>{Math.round(comp.value)}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{comp.label}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>Weight: {comp.weight}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 24, padding: 16, background: "#F8FAFC", borderRadius: 8 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#64748B", margin: "0 0 8px" }}>Enrollment Trend (2019–2024)</h4>
                  <div style={{ display: "flex", alignItems: "end", gap: 8, height: 80 }}>
                    {selectedSchool.enrollTrend.map((v, i) => {
                      const max = Math.max(...selectedSchool.enrollTrend);
                      const min = Math.min(...selectedSchool.enrollTrend) * 0.9;
                      const h = ((v - min) / (max - min)) * 70 + 10;
                      return (
                        <div key={i} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>{(v / 1000).toFixed(1)}K</div>
                          <div style={{ height: h, background: i === selectedSchool.enrollTrend.length - 1 ? tierConfig[selectedSchool.tier].color : "#CBD5E1", borderRadius: "4px 4px 0 0" }} />
                          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>{YEARS[i]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 48, color: "#94A3B8", background: "white", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                Select a school above to see detailed analysis
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 32, padding: "16px 0", borderTop: "1px solid #E2E8F0", textAlign: "center", fontSize: 11, color: "#94A3B8" }}>
          Pranav Piedy · UCLA Anderson MSBA '26 · Data Sources: IPEDS, NCUA 5300 Call Reports, U.S. Census Bureau
        </div>
      </div>
    </div>
  );
}
