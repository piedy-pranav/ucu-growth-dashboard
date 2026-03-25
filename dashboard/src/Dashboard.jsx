import { useState, useMemo, useEffect } from "react";

/*
 * UCU Partnership Growth Strategy Dashboard
 * 
 * DATA: Reads JSON files exported by the Jupyter notebook.
 * Place these files in: dashboard/public/data/
 *   - opportunity_scorecard.json  (from notebook export)
 *   - enrollment_trends.json      (from notebook export)
 *   - ncua_financials.json        (from notebook export)
 *   - yearly_tam.json             (from notebook export)
 *
 * WORKFLOW:
 *   1. Run the Jupyter notebook (produces JSON in UCU/data/)
 *   2. Copy the 4 JSON files to UCU/dashboard/public/data/
 *   3. npm start (or npm run deploy for GitHub Pages)
 *
 * For GitHub Pages: set "homepage" in package.json to your repo URL.
 * The %PUBLIC_URL% prefix ensures paths resolve correctly.
 */

// ═══════════════════════════════════════════════════════════════
// UCU BRAND PALETTE
// ═══════════════════════════════════════════════════════════════
const P = {
  ink: "#0C2340", ocean: "#006A8E", sky: "#4DA8DA", sun: "#E8A838",
  leaf: "#2D8659", cloud: "#F5F7FA", ash: "#8C96A4", bone: "#FFFFFF", slate: "#3A4555",
};
const TIER_CFG = {
  "Tier 1: Prioritize": { label:"Prioritize", num:1, color:P.leaf, bg:"#EBF5F0", border:"#B8DFCA" },
  "Tier 2: Grow":       { label:"Grow", num:2, color:P.ocean, bg:"#E8F4F8", border:"#B3D9E8" },
  "Tier 3: Maintain":   { label:"Maintain", num:3, color:P.ash, bg:P.cloud, border:"#D4D9E0" },
};
const YEARS = [2019,2020,2021,2022,2023,2024];
const LINE_COLORS = [P.ink, P.ocean, P.sun, P.leaf, "#8B5CF6", "#EF4444"];
const font = "'Libre Franklin', 'Helvetica Neue', sans-serif";
const mono = "'IBM Plex Mono', 'SF Mono', monospace";

// ═══════════════════════════════════════════════════════════════
// MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Spark({ data, color, w=72, h=24 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), r = mx-mn||1;
  const pts = data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/r)*(h-4)-2}`).join(" ");
  const ly = h-((data[data.length-1]-mn)/r)*(h-4)-2;
  return <svg width={w} height={h} style={{display:"block"}}>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx={w} cy={ly} r="2.5" fill={color}/>
  </svg>;
}

function Bar({ value, color }) {
  return <div style={{display:"flex",alignItems:"center",gap:4}}>
    <div style={{width:48,height:4,background:"#E2E8F0",borderRadius:2,overflow:"hidden"}}>
      <div style={{width:`${value}%`,height:"100%",background:color,borderRadius:2}}/>
    </div>
    <span style={{fontSize:10,color:P.ash,fontVariantNumeric:"tabular-nums",minWidth:18}}>{Math.round(value)}</span>
  </div>;
}

function Kpi({ label, value, sub, accent }) {
  return <div style={{background:P.bone,borderRadius:8,padding:"16px 20px",border:"1px solid #E8ECF1",flex:1,minWidth:140}}>
    <div style={{fontSize:10,color:P.ash,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2,fontFamily:mono}}>{label}</div>
    <div style={{fontSize:24,fontWeight:700,color:accent||P.ink,lineHeight:1.2,fontFamily:font}}>{value}</div>
    {sub && <div style={{fontSize:11,color:P.ash,marginTop:2}}>{sub}</div>}
  </div>;
}

function NcuaChart({ data, field, label, color, formatter }) {
  if (!data || data.length === 0) return null;
  const vals = data.map(d=>d[field]).filter(v=>v!=null);
  if (vals.length === 0) return null;
  const mn=Math.min(...vals)*0.95, mx=Math.max(...vals)*1.02, r=mx-mn||1;
  const W=280, H=120, px=36, py=12;
  return <div>
    <div style={{fontSize:11,fontWeight:600,color:P.slate,marginBottom:6,fontFamily:mono}}>{label}</div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W}}>
      <defs><linearGradient id={`g_${field}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {[0,0.25,0.5,0.75,1].map(p=>{const y=py+(1-p)*(H-2*py);const v=mn+p*r;
        return <g key={p}><line x1={px} y1={y} x2={W-8} y2={y} stroke="#E8ECF1" strokeDasharray="3"/>
          <text x={px-4} y={y+3} textAnchor="end" fontSize="8" fill={P.ash}>{formatter(v)}</text></g>;})}
      <polygon points={data.map((d,i)=>{const x=px+(i/(data.length-1))*(W-px-8);const y=py+(1-(d[field]-mn)/r)*(H-2*py);return `${x},${y}`;}).join(" ")+` ${px+(data.length-1)/(data.length-1)*(W-px-8)},${H-py} ${px},${H-py}`} fill={`url(#g_${field})`}/>
      <polyline points={data.map((d,i)=>{const x=px+(i/(data.length-1))*(W-px-8);const y=py+(1-(d[field]-mn)/r)*(H-2*py);return `${x},${y}`;}).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {data.map((d,i)=>{const x=px+(i/(data.length-1))*(W-px-8);const y=py+(1-(d[field]-mn)/r)*(H-2*py);
        return <g key={i}><circle cx={x} cy={y} r="3" fill={P.bone} stroke={color} strokeWidth="1.5"/>
          <text x={x} y={H-2} textAnchor="middle" fontSize="8" fill={P.ash}>{d.year}</text></g>;})}
    </svg>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [scorecard, setScorecard] = useState([]);
  const [trends, setTrends] = useState([]);
  const [ncua, setNcua] = useState([]);
  const [yearlyTam, setYearlyTam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tierFilter, setTier] = useState("all");
  const [sortBy, setSort] = useState("score");
  const [view, setView] = useState("scorecard");
  const [selected, setSelected] = useState(null);

  // Load JSON data from public/data/
  useEffect(() => {
    const base = process.env.PUBLIC_URL || "";
    Promise.all([
      fetch(`${base}/data/opportunity_scorecard.json`).then(r => r.ok ? r.json() : Promise.reject("scorecard missing")),
      fetch(`${base}/data/enrollment_trends.json`).then(r => r.ok ? r.json() : Promise.reject("trends missing")),
      fetch(`${base}/data/ncua_financials.json`).then(r => r.ok ? r.json() : Promise.reject("ncua missing")),
      fetch(`${base}/data/yearly_tam.json`).then(r => r.ok ? r.json() : Promise.reject("yearly_tam missing")),
    ]).then(([sc, tr, nc, yt]) => {
      setScorecard(sc); setTrends(tr); setNcua(nc); setYearlyTam(yt); setLoading(false);
    }).catch(err => {
      setError(String(err));
      setLoading(false);
    });
  }, []);

  // Derived data
  const schools = useMemo(() => {
    if (!scorecard.length || !trends.length) return [];
    return scorecard.map(s => {
      const schoolTrends = trends.filter(t => t.institution_name === s.institution_name).sort((a,b) => a.year - b.year);
      const enrollTrend = schoolTrends.map(t => t.total_enrollment);
      const staffTrend = schoolTrends.map(t => t.total_employees);
      const tc = TIER_CFG[s.tier] || TIER_CFG["Tier 3: Maintain"];
      return {
        ...s,
        enrollTrend, staffTrend,
        tierNum: tc.num, tierLabel: tc.label, tierColor: tc.color, tierBg: tc.bg, tierBorder: tc.border,
      };
    }).sort((a,b) => b.opportunity_score - a.opportunity_score);
  }, [scorecard, trends]);

  const totalTam = useMemo(() => schools.reduce((s,d) => s + (d.total_addressable_pop||0), 0), [schools]);
  const members2024 = useMemo(() => ncua.length ? ncua[ncua.length-1].members : 0, [ncua]);
  const penPct = totalTam > 0 ? ((members2024/totalTam)*100).toFixed(1) : "0";
  const assets2024 = useMemo(() => ncua.length ? ncua[ncua.length-1].total_assets : 0, [ncua]);

  const filtered = useMemo(() => {
    let d = [...schools];
    if (tierFilter !== "all") d = d.filter(s => s.tierNum === parseInt(tierFilter));
    d.sort((a,b) => sortBy==="score" ? b.opportunity_score-a.opportunity_score : sortBy==="tam" ? b.total_addressable_pop-a.total_addressable_pop : (a.partnership_age||0)-(b.partnership_age||0));
    return d;
  }, [schools, tierFilter, sortBy]);

  // ─── LOADING / ERROR ───
  if (loading) return <div style={{fontFamily:font,display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:P.ash}}>Loading dashboard data...</div>;
  if (error) return <div style={{fontFamily:font,padding:40,color:"#C0392B"}}>
    <h2>Data files not found</h2>
    <p style={{marginTop:12,color:P.slate}}>Place these JSON files in <code>dashboard/public/data/</code>:</p>
    <ul style={{marginTop:8,lineHeight:2}}>
      <li><code>opportunity_scorecard.json</code></li>
      <li><code>enrollment_trends.json</code></li>
      <li><code>ncua_financials.json</code></li>
      <li><code>yearly_tam.json</code></li>
    </ul>
    <p style={{marginTop:12,color:P.ash}}>Run the Jupyter notebook first to generate these files, then copy them here.</p>
    <p style={{marginTop:8,color:P.ash,fontSize:12}}>Error: {error}</p>
  </div>;

  return (
    <div style={{fontFamily:font, background:P.cloud, minHeight:"100vh", color:P.slate}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>

      {/* ─── HEADER ─── */}
      <header style={{background:P.ink,padding:"24px 28px 20px",color:P.bone}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:P.sky,marginBottom:4,fontFamily:mono}}>Credit Union Partnership Growth Strategy</div>
          <h1 style={{fontSize:22,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>UCU Opportunity Scorecard</h1>
          <div style={{fontSize:11,color:P.ash,marginTop:4,fontFamily:mono}}>IPEDS · NCUA 5300 · U.S. Census · 2019–2024</div>
        </div>
      </header>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 28px 40px"}}>

        {/* ─── KPI ROW ─── */}
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <Kpi label="Total Addressable Market" value={totalTam.toLocaleString()} sub="Students + staff, Fall 2024" accent={P.ink}/>
          <Kpi label="UCU Members" value={members2024.toLocaleString()} sub="Q4 2024, NCUA" accent={P.ocean}/>
          <Kpi label="Penetration" value={`${penPct}%`} sub={`${(totalTam-members2024).toLocaleString()} untapped`} accent={P.sun}/>
          <Kpi label="Total Assets" value={assets2024 >= 1e9 ? `$${(assets2024/1e9).toFixed(2)}B` : `$${(assets2024/1e6).toFixed(0)}M`} sub={ncua.length >= 2 ? `+${(((ncua[ncua.length-1].total_assets/ncua[0].total_assets)-1)*100).toFixed(1)}% since ${ncua[0].year}` : ""} accent={P.leaf}/>
        </div>

        {/* ─── TABS ─── */}
        <div style={{display:"flex",gap:2,marginBottom:18,background:P.bone,borderRadius:6,padding:3,border:"1px solid #E8ECF1",width:"fit-content"}}>
          {[["scorecard","Scorecard"],["trends","Enrollment Trends"],["financials","UCU Financials"],["detail","School Detail"]].map(([k,l]) =>
            <button key={k} onClick={()=>setView(k)} style={{
              padding:"7px 18px",borderRadius:4,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:font,
              background:view===k?P.ink:"transparent",color:view===k?P.bone:P.ash,transition:"all 0.15s"
            }}>{l}</button>
          )}
        </div>

        {/* ═══════════ SCORECARD VIEW ═══════════ */}
        {view === "scorecard" && <>
          <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap",fontSize:11}}>
            <span style={{color:P.ash,fontWeight:600,fontFamily:mono}}>TIER</span>
            {[["all","All"],["1","T1"],["2","T2"],["3","T3"]].map(([v,l]) =>
              <button key={v} onClick={()=>setTier(v)} style={{padding:"4px 12px",borderRadius:4,border:`1px solid ${tierFilter===v?P.ink:"#D4D9E0"}`,background:tierFilter===v?P.ink:P.bone,color:tierFilter===v?P.bone:P.ash,cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font}}>{l}</button>
            )}
            <span style={{color:P.ash,fontWeight:600,fontFamily:mono,marginLeft:10}}>SORT</span>
            {[["score","Score"],["tam","TAM"],["age","Newest"]].map(([v,l]) =>
              <button key={v} onClick={()=>setSort(v)} style={{padding:"4px 12px",borderRadius:4,border:`1px solid ${sortBy===v?P.ocean:"#D4D9E0"}`,background:sortBy===v?"#E8F4F8":P.bone,color:sortBy===v?P.ocean:P.ash,cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font}}>{l}</button>
            )}
          </div>

          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead><tr style={{background:P.cloud,borderBottom:"2px solid #E8ECF1"}}>
                {["University","Tier","TAM","Trend","Size","Growth","Need","Fresh","Score"].map(h =>
                  <th key={h} style={{textAlign:h==="University"?"left":"center",padding:"10px 12px",fontWeight:600,color:P.ash,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:mono}}>{h}</th>
                )}
              </tr></thead>
              <tbody>
                {filtered.map(s => <tr key={s.institution_name} onClick={()=>{setSelected(s);setView("detail")}}
                  style={{borderBottom:"1px solid #F0F2F5",cursor:"pointer",transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"12px"}}>
                    <div style={{fontWeight:600,color:P.ink,fontSize:12}}>{s.institution_name}</div>
                    <div style={{fontSize:10,color:P.ash}}>{s.state} · {s.conference} · {Math.round(s.partnership_age||0)}yr</div>
                  </td>
                  <td style={{textAlign:"center",padding:"12px 6px"}}>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:s.tierBg,color:s.tierColor,border:`1px solid ${s.tierBorder}`}}>T{s.tierNum}</span>
                  </td>
                  <td style={{textAlign:"right",padding:"12px 6px",fontWeight:600,fontVariantNumeric:"tabular-nums",fontFamily:mono,fontSize:11}}>{(s.total_addressable_pop||0).toLocaleString()}</td>
                  <td style={{textAlign:"center",padding:"12px 6px"}}><div style={{display:"flex",justifyContent:"center"}}><Spark data={s.enrollTrend} color={s.tierColor}/></div></td>
                  <td style={{padding:"12px 6px"}}><Bar value={s.size_score||0} color={P.ink}/></td>
                  <td style={{padding:"12px 6px"}}><Bar value={s.growth_score||0} color={P.ocean}/></td>
                  <td style={{padding:"12px 6px"}}><Bar value={s.need_score||0} color={P.sun}/></td>
                  <td style={{padding:"12px 6px"}}><Bar value={s.freshness_score||0} color={P.leaf}/></td>
                  <td style={{textAlign:"center",padding:"12px"}}><div style={{fontSize:18,fontWeight:800,color:s.tierColor}}>{Math.round(s.opportunity_score||0)}</div></td>
                </tr>)}
              </tbody>
            </table>
          </div>

          <div style={{marginTop:12,padding:"12px 16px",background:P.bone,borderRadius:6,border:"1px solid #E8ECF1"}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6,fontFamily:mono}}>Scoring Methodology</div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:11,color:P.ash}}>
              <span><b style={{color:P.ink}}>Size 40%</b> — Addressable population</span>
              <span><b style={{color:P.ocean}}>Growth 20%</b> — Enrollment YoY</span>
              <span><b style={{color:P.sun}}>Need 20%</b> — Financial need (inverse income)</span>
              <span><b style={{color:P.leaf}}>Freshness 20%</b> — Partnership newness</span>
            </div>
          </div>
        </>}

        {/* ═══════════ ENROLLMENT TRENDS VIEW ═══════════ */}
        {view === "trends" && <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Addressable Market bar chart */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14,fontFamily:mono}}>Addressable Market by Partner School (Fall 2024)</div>
            {(() => {
              const sorted = [...schools].sort((a,b) => a.total_addressable_pop - b.total_addressable_pop);
              const maxTam = Math.max(...sorted.map(s => s.total_addressable_pop||1));
              return <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {sorted.map(s => {
                  const w = ((s.total_addressable_pop||0)/maxTam)*100;
                  const isTop = (s.total_addressable_pop||0) > sorted.map(d=>d.total_addressable_pop).sort((a,b)=>b-a)[3];
                  return <div key={s.institution_name} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:140,fontSize:11,fontWeight:500,color:P.slate,textAlign:"right",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.institution_name}</div>
                    <div style={{flex:1,height:18,background:"#F0F2F5",borderRadius:3,overflow:"hidden"}}>
                      <div style={{width:`${w}%`,height:"100%",background:isTop?P.ocean:P.ink,opacity:0.8,borderRadius:3,transition:"width 0.4s"}}/>
                    </div>
                    <div style={{width:65,fontSize:10,fontFamily:mono,color:P.slate,fontWeight:600}}>{(s.total_addressable_pop||0).toLocaleString()}</div>
                  </div>;
                })}
                <div style={{marginTop:8,textAlign:"right",fontSize:12,fontWeight:700,color:P.sun}}>Total TAM: {totalTam.toLocaleString()}</div>
              </div>;
            })()}
          </div>

          {/* Multi-line enrollment trends */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14,fontFamily:mono}}>Fall Enrollment Trends — Top Partners (2019–2024)</div>
            {(() => {
              const top6 = [...schools].sort((a,b) => (b.total_enrollment||0)-(a.total_enrollment||0)).slice(0,6);
              const allVals = top6.flatMap(s => s.enrollTrend||[]).filter(v=>v>0);
              if (allVals.length === 0) return <div style={{color:P.ash}}>No trend data available</div>;
              const mn=Math.min(...allVals)*0.95, mx=Math.max(...allVals)*1.02, rng=mx-mn||1;
              const W=600, H=240, px=44, py=16, pw=W-px-100, ph=H-2*py-10;
              return <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W}}>
                {[0,0.25,0.5,0.75,1].map(p=>{const y=py+(1-p)*ph;const v=mn+p*rng;
                  return <g key={p}><line x1={px} y1={y} x2={px+pw} y2={y} stroke="#E8ECF1" strokeDasharray="3"/>
                    <text x={px-4} y={y+3} textAnchor="end" fontSize="8" fill={P.ash}>{(v/1000).toFixed(0)}K</text></g>;})}
                {YEARS.map((yr,i)=>{const x=px+(i/(YEARS.length-1))*pw;
                  return <text key={yr} x={x} y={H-4} textAnchor="middle" fontSize="9" fill={P.ash} fontFamily={mono}>{yr}</text>;})}
                {(()=>{const x1=px+(1/5)*pw,x2=px+(2/5)*pw;return <g><rect x={x1} y={py} width={x2-x1} height={ph} fill="#EF4444" opacity="0.05"/>
                  <text x={(x1+x2)/2} y={py+12} textAnchor="middle" fontSize="8" fill="#EF4444" opacity="0.6">COVID-19</text></g>;})()}
                {top6.map((s,si)=>{const t=s.enrollTrend||[];if(t.length<2)return null;
                  const pts=t.map((v,i)=>{const x=px+(i/(YEARS.length-1))*pw;const y=py+(1-(v-mn)/rng)*ph;return `${x},${y}`;}).join(" ");
                  const lastI=t.length-1;const lastX=px+(lastI/(YEARS.length-1))*pw;const lastY=py+(1-(t[lastI]-mn)/rng)*ph;
                  return <g key={s.institution_name}>
                    <polyline points={pts} fill="none" stroke={LINE_COLORS[si]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    {t.map((v,i)=>{const x=px+(i/(YEARS.length-1))*pw;const y=py+(1-(v-mn)/rng)*ph;return <circle key={i} cx={x} cy={y} r="3" fill={P.bone} stroke={LINE_COLORS[si]} strokeWidth="1.5"/>;})}
                    <text x={lastX+6} y={lastY+3} fontSize="9" fill={LINE_COLORS[si]} fontWeight="600">{s.institution_name}</text>
                  </g>;})}
              </svg>;
            })()}
          </div>

          {/* YoY change */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,fontFamily:mono}}>Year-over-Year Enrollment Change (2023 → 2024)</div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              {[...schools].sort((a,b) => (b.enrollment_yoy||0)-(a.enrollment_yoy||0)).map(s => {
                const yoy = s.enrollment_yoy || 0;
                const isPos = yoy >= 0;
                const barW = Math.min(Math.abs(yoy)*2.5, 50);
                return <div key={s.institution_name} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0"}}>
                  <div style={{width:140,fontSize:11,fontWeight:500,color:P.slate,textAlign:"right",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.institution_name}</div>
                  <div style={{flex:1,display:"flex",alignItems:"center",position:"relative",height:14}}>
                    <div style={{position:"absolute",left:"50%",top:0,width:1,height:"100%",background:"#E8ECF1"}}/>
                    {isPos ?
                      <div style={{position:"absolute",left:"50%",height:10,width:`${barW}%`,background:P.leaf,opacity:0.7,borderRadius:"0 2px 2px 0"}}/> :
                      <div style={{position:"absolute",right:"50%",height:10,width:`${barW}%`,background:"#EF4444",opacity:0.7,borderRadius:"2px 0 0 2px"}}/>
                    }
                  </div>
                  <div style={{width:55,fontSize:11,fontFamily:mono,fontWeight:600,color:isPos?P.leaf:"#EF4444",textAlign:"right"}}>{isPos?"+":""}{yoy.toFixed(1)}%</div>
                </div>;
              })}
            </div>
          </div>
        </div>}

        {/* ═══════════ FINANCIALS VIEW ═══════════ */}
        {view === "financials" && <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaChart data={ncua} field="members" label="MEMBERS" color={P.ink} formatter={v=>`${(v/1000).toFixed(0)}K`}/>
            </div>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaChart data={ncua} field="total_assets" label="TOTAL ASSETS" color={P.ocean} formatter={v=>`$${(v/1e9).toFixed(1)}B`}/>
            </div>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaChart data={ncua} field="total_loans" label="TOTAL LOANS" color={P.sun} formatter={v=>`$${(v/1e6).toFixed(0)}M`}/>
            </div>
          </div>

          {/* Growth summary */}
          {ncua.length >= 2 && <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,fontFamily:mono}}>
              {ncua.length}-Year Growth ({ncua[0].year}→{ncua[ncua.length-1].year})
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {l:"Members",v0:ncua[0].members,v1:ncua[ncua.length-1].members,c:P.ink,fmt:v=>v.toLocaleString()},
                {l:"Assets",v0:ncua[0].total_assets,v1:ncua[ncua.length-1].total_assets,c:P.ocean,fmt:v=>v>=1e9?`$${(v/1e9).toFixed(2)}B`:`$${(v/1e6).toFixed(0)}M`},
                {l:"Loans",v0:ncua[0].total_loans,v1:ncua[ncua.length-1].total_loans,c:P.sun,fmt:v=>v>=1e9?`$${(v/1e9).toFixed(2)}B`:`$${(v/1e6).toFixed(0)}M`},
                {l:"Net Worth",v0:ncua[0].net_worth,v1:ncua[ncua.length-1].net_worth,c:P.leaf,fmt:v=>`$${(v/1e6).toFixed(0)}M`},
              ].map(m => <div key={m.l} style={{padding:12,background:P.cloud,borderRadius:6}}>
                <div style={{fontSize:10,color:P.ash,fontFamily:mono}}>{m.l}</div>
                <div style={{fontSize:10,color:P.ash,marginTop:4}}>{m.fmt(m.v0)} →</div>
                <div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.fmt(m.v1)}</div>
                <div style={{fontSize:12,fontWeight:700,color:m.c,marginTop:2}}>+{(((m.v1/m.v0)-1)*100).toFixed(1)}%</div>
              </div>)}
            </div>
          </div>}

          {/* Penetration dual-axis chart */}
          {yearlyTam.length > 0 && ncua.length > 0 && <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14,fontFamily:mono}}>UCU Membership vs. Total Addressable Market</div>
            <svg viewBox="0 0 600 260" style={{width:"100%",maxWidth:600}}>
              {[0,0.25,0.5,0.75,1].map(p=>{const y=20+(1-p)*190;return <line key={p} x1="50" y1={y} x2="570" y2={y} stroke="#E8ECF1" strokeDasharray="3"/>;})}
              {(() => {
                const maxTamVal = Math.max(...yearlyTam.map(y=>y.total_tam))*1.05;
                const maxMem = Math.max(...ncua.map(n=>n.members))*1.15;
                return <>
                  {[0,0.25,0.5,0.75,1].map(p=>{const y=20+(1-p)*190;const v=maxTamVal*p;
                    return <text key={`l${p}`} x="46" y={y+3} textAnchor="end" fontSize="8" fill={P.ash}>{v>0?`${(v/1000).toFixed(0)}K`:""}</text>;})}
                  {[0,0.25,0.5,0.75,1].map(p=>{const y=20+(1-p)*190;const v=maxMem*p;
                    return <text key={`r${p}`} x="574" y={y+3} textAnchor="start" fontSize="8" fill={P.sun}>{v>0?`${(v/1000).toFixed(0)}K`:""}</text>;})}
                  {yearlyTam.map((yt,i)=>{const x=70+i*88;const h=(yt.total_tam/maxTamVal)*190;const y=210-h;
                    return <g key={i}><rect x={x} y={y} width="40" height={h} fill={P.ink} opacity="0.18" rx="3"/>
                      <text x={x+20} y={232} textAnchor="middle" fontSize="9" fill={P.ash} fontFamily={mono}>{yt.year}</text></g>;})}
                  <polyline points={ncua.map((n,i)=>{const x=90+i*88;const y=20+(1-n.members/maxMem)*190;return `${x},${y}`;}).join(" ")} fill="none" stroke={P.sun} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  {ncua.map((n,i)=>{const x=90+i*88;const y=20+(1-n.members/maxMem)*190;
                    const pen = yearlyTam[i] ? ((n.members/yearlyTam[i].total_tam)*100).toFixed(1) : "?";
                    return <g key={i}><circle cx={x} cy={y} r="4.5" fill={P.bone} stroke={P.sun} strokeWidth="2"/>
                      <rect x={x-18} y={y-22} width="36" height="16" rx="3" fill="#FFF5F5" stroke="#C0392B" strokeWidth="0.5"/>
                      <text x={x} y={y-11} textAnchor="middle" fontSize="9" fontWeight="700" fill="#C0392B">{pen}%</text></g>;})}
                </>;
              })()}
            </svg>
            <div style={{display:"flex",gap:16,marginTop:8,fontSize:10,color:P.ash}}>
              <span><span style={{display:"inline-block",width:10,height:10,background:P.ink,opacity:0.18,borderRadius:2,marginRight:4}}/>TAM</span>
              <span><span style={{display:"inline-block",width:10,height:3,background:P.sun,borderRadius:1,marginRight:4,verticalAlign:"middle"}}/>UCU Members</span>
              <span><span style={{display:"inline-block",width:8,height:8,background:"#FFF5F5",border:"1px solid #C0392B",borderRadius:2,marginRight:4}}/>Penetration %</span>
            </div>
            <p style={{fontSize:12,color:P.ash,marginTop:12,lineHeight:1.6}}>
              A 5-point penetration increase = approximately <b style={{color:P.ink}}>{Math.round(totalTam*0.05).toLocaleString()} new member-owners</b>.
            </p>
          </div>}
        </div>}

        {/* ═══════════ DETAIL VIEW ═══════════ */}
        {view === "detail" && <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {schools.map(s => <button key={s.institution_name} onClick={()=>setSelected(s)} style={{
              padding:"4px 10px",borderRadius:6,border:`1px solid ${selected?.institution_name===s.institution_name?s.tierColor:"#D4D9E0"}`,
              background:selected?.institution_name===s.institution_name?s.tierBg:P.bone,color:selected?.institution_name===s.institution_name?s.tierColor:P.ash,
              cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font
            }}>{s.institution_name}</button>)}
          </div>

          {selected ? <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:800,margin:0,color:P.ink}}>{selected.institution_name}</h2>
                <p style={{fontSize:12,color:P.ash,margin:"4px 0 0"}}>{selected.state} · {selected.conference} · {selected.institution_type} · Partner since {2024-Math.round(selected.partnership_age||0)}</p>
              </div>
              <div style={{textAlign:"center",padding:"6px 14px",background:selected.tierBg,borderRadius:8,border:`1px solid ${selected.tierBorder}`}}>
                <div style={{fontSize:24,fontWeight:800,color:selected.tierColor}}>{Math.round(selected.opportunity_score||0)}</div>
                <div style={{fontSize:9,color:selected.tierColor,fontWeight:600,fontFamily:mono}}>{selected.tierLabel}</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {[{l:"Addressable Pop.",v:(selected.total_addressable_pop||0).toLocaleString(),c:P.ink},
                {l:"Enrollment",v:(selected.total_enrollment||0).toLocaleString(),c:P.ocean},
                {l:"Staff",v:(selected.total_employees||0).toLocaleString(),c:P.leaf},
                {l:"Median Income",v:`$${((selected.median_income||0)/1000).toFixed(0)}K`,c:P.sun}
              ].map(m => <div key={m.l} style={{padding:12,background:P.cloud,borderRadius:6}}>
                <div style={{fontSize:9,color:P.ash,fontFamily:mono}}>{m.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div>
              </div>)}
            </div>

            {/* Score breakdown — arc progress circles */}
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,fontFamily:mono}}>Score Breakdown</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {[{l:"Market Size",v:Math.round(selected.size_score||0),w:"40%",c:P.ink},
                {l:"Growth",v:Math.round(selected.growth_score||0),w:"20%",c:P.ocean},
                {l:"Financial Need",v:Math.round(selected.need_score||0),w:"20%",c:P.sun},
                {l:"Freshness",v:Math.round(selected.freshness_score||0),w:"20%",c:P.leaf}
              ].map(comp => {
                const r=24, cx=28, cy=28, circ=2*Math.PI*r;
                const filled=circ*(comp.v/100), gap=circ-filled;
                return <div key={comp.l} style={{textAlign:"center"}}>
                  <svg width="56" height="56" style={{display:"block",margin:"0 auto 6px"}}>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8ECF1" strokeWidth="3"/>
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={comp.c} strokeWidth="3"
                      strokeDasharray={`${filled} ${gap}`} strokeDashoffset={circ*0.25}
                      strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
                      style={{transition:"stroke-dasharray 0.5s ease"}}/>
                    <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill={comp.c} fontFamily={font}>{comp.v}</text>
                  </svg>
                  <div style={{fontSize:11,fontWeight:600,color:P.slate}}>{comp.l}</div>
                  <div style={{fontSize:9,color:P.ash,fontFamily:mono}}>{comp.w}</div>
                </div>;
              })}
            </div>

            {/* Enrollment trend bars */}
            <div style={{marginTop:20,padding:16,background:P.cloud,borderRadius:6}}>
              <div style={{fontSize:9,fontWeight:600,color:P.ash,fontFamily:mono,marginBottom:12}}>FALL ENROLLMENT 2019–2024</div>
              <div style={{display:"flex",alignItems:"end",gap:10,height:130,paddingTop:20}}>
                {(selected.enrollTrend||[]).map((v,i) => {
                  const vals = selected.enrollTrend||[];
                  const mx = Math.max(...vals), mn = Math.min(...vals)*0.85, range=mx-mn||1;
                  const h = ((v-mn)/range)*100+12;
                  return <div key={i} style={{flex:1,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{fontSize:10,color:P.slate,marginBottom:4,fontFamily:mono,fontWeight:i===vals.length-1?700:400,whiteSpace:"nowrap"}}>{(v/1000).toFixed(1)}K</div>
                    <div style={{width:"70%",height:h,background:i===vals.length-1?selected.tierColor:"#D4D9E0",borderRadius:"4px 4px 0 0",transition:"height 0.3s"}}/>
                    <div style={{fontSize:10,color:P.ash,marginTop:6,fontFamily:mono}}>{YEARS[i]||""}</div>
                  </div>;
                })}
              </div>
            </div>
          </div> : <div style={{textAlign:"center",padding:40,color:P.ash,background:P.bone,borderRadius:8,border:"1px solid #E8ECF1"}}>Select a school above</div>}
        </div>}

        <div style={{marginTop:28,padding:"12px 0",borderTop:"1px solid #E8ECF1",textAlign:"center",fontSize:10,color:P.ash,fontFamily:mono}}>
          Pranav Piedy · UCLA Anderson MSBA '26 · Sources: IPEDS (NCES), NCUA 5300 Call Reports, U.S. Census Bureau
        </div>
      </div>
    </div>
  );
}
