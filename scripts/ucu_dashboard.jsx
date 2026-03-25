import { useState, useMemo } from "react";

/*
 * UCU Partnership Growth Strategy Dashboard
 * Data: IPEDS Fall Enrollment, IPEDS Employees (EAP), NCUA 5300 Call Reports
 * 
 * DEPLOYMENT (GitHub Pages):
 *   1. npx create-react-app ucu-dashboard && cd ucu-dashboard
 *   2. Replace src/App.js with this file's default export
 *   3. npm install gh-pages
 *   4. Add to package.json: "homepage": "https://<username>.github.io/ucu-dashboard"
 *   5. Add scripts: "predeploy": "npm run build", "deploy": "gh-pages -d build"
 *   6. npm run deploy
 *
 * DATA NOTE: All data below is from real federal sources.
 *   - Enrollment/Staff: IPEDS (nces.ed.gov/ipeds), Fall 2024
 *   - Financials: NCUA 5300 Call Reports (ncua.gov), Q4 2019-2024
 *   - CU Number: 64171 (University Credit Union, Los Angeles)
 */

// ═══════════════════════════════════════════════════════════════
// REAL DATA — IPEDS + NCUA
// ═══════════════════════════════════════════════════════════════

const SCHOOLS = [
  { name:"UCLA", tam:77471, enroll:47335, staff:30136, score:0, tier:0, age:73, state:"CA", conf:"Founding", type:"Public R1", income:82000,
    trend:[44589,43548,44537,46116,47041,47335], staffTrend:[25715,27474,27982,28405,28964,30136] },
  { name:"Georgia Tech", tam:64317, enroll:53363, staff:10954, score:0, tier:0, age:3, state:"GA", conf:"Out-of-State", type:"Public R1", income:75000,
    trend:[36489,39771,44108,46042,47620,53363], staffTrend:[10780,10654,10609,10555,10726,10954] },
  { name:"UC San Diego", tam:63760, enroll:44256, staff:19504, score:0, tier:0, age:4, state:"CA", conf:"UC System", type:"Public R1", income:85000,
    trend:[38798,39576,41885,42006,42961,44256], staffTrend:[17680,18199,18709,18830,19141,19504] },
  { name:"UC Davis", tam:55094, enroll:40065, staff:15029, score:0, tier:0, age:5, state:"CA", conf:"UC System", type:"Public R1", income:78000,
    trend:[38167,39679,40031,40618,40343,40065], staffTrend:[15051,15210,14878,14750,14894,15029] },
  { name:"UT Arlington", tam:49614, enroll:44956, staff:4658, score:0, tier:0, age:0, state:"TX", conf:"Out-of-State", type:"Public R1", income:72000,
    trend:[42964,41888,42638,40726,43580,44956], staffTrend:[4879,5252,4738,4486,4496,4658] },
  { name:"UC Irvine", tam:47503, enroll:37297, staff:10206, score:0, tier:0, age:6, state:"CA", conf:"UC System", type:"Public R1", income:82000,
    trend:[35220,35138,36908,35937,36156,37297], staffTrend:[10177,10476,10451,9868,9872,10206] },
  { name:"LMU", tam:12818, enroll:10179, staff:2639, score:0, tier:0, age:12, state:"CA", conf:"WCC", type:"Private", income:82000,
    trend:[9610,9556,9802,9881,9756,10179], staffTrend:[2672,2458,2546,2457,2590,2639] },
  { name:"Pepperdine", tam:11141, enroll:8976, staff:2165, score:0, tier:0, age:14, state:"CA", conf:"WCC", type:"Private", income:82000,
    trend:[9145,8419,8617,8933,9210,8976], staffTrend:[2242,2079,2063,2047,2043,2165] },
  { name:"Santa Clara", tam:11831, enroll:9728, staff:2103, score:0, tier:0, age:9, state:"CA", conf:"WCC", type:"Private", income:133000,
    trend:[8770,8850,9084,9410,9626,9728], staffTrend:[2253,2208,2151,2047,2068,2103] },
  { name:"Chabot College", tam:6955, enroll:6538, staff:417, score:0, tier:0, age:10, state:"CA", conf:"CC", type:"Community College", income:120000,
    trend:[12621,10197,8740,8053,7461,6538], staffTrend:[802,523,556,510,532,417] },
  { name:"Abilene Christian", tam:6424, enroll:5219, staff:1205, score:0, tier:0, age:0, state:"TX", conf:"WAC", type:"Private", income:52000,
    trend:[5217,5046,4842,4939,5058,5219], staffTrend:[1326,1245,1256,1220,1265,1205] },
  { name:"Mt. St. Mary's", tam:4672, enroll:4225, staff:447, score:0, tier:0, age:8, state:"CA", conf:"LA Local", type:"Private", income:82000,
    trend:[3577,3175,3118,2793,2860,4225], staffTrend:[561,510,541,445,419,447] },
  { name:"Saint Mary's", tam:2445, enroll:1900, staff:545, score:0, tier:0, age:0, state:"CA", conf:"WCC", type:"Private", income:120000,
    trend:[3359,2937,2838,2758,2506,1900], staffTrend:[642,656,654,625,578,545] },
  { name:"Las Positas", tam:827, enroll:640, staff:187, score:0, tier:0, age:10, state:"CA", conf:"CC", type:"Community College", income:120000,
    trend:[8254,6679,5662,5191,5230,640], staffTrend:[522,467,403,365,398,187] },
];

const NCUA = [
  { year:2019, members:41066, assets:739871151, loans:406406252, netIncome:4016112, netWorth:65096309 },
  { year:2020, members:41969, assets:872638821, loans:510882218, netIncome:3902914, netWorth:68999223 },
  { year:2021, members:49397, assets:1047100792, loans:659680429, netIncome:5484754, netWorth:83759524 },
  { year:2022, members:52065, assets:1226015965, loans:1021091497, netIncome:7263757, netWorth:91023281 },
  { year:2023, members:52100, assets:1165726882, loans:1023565924, netIncome:6047920, netWorth:97071201 },
  { year:2024, members:56372, assets:1135866462, loans:948854840, netIncome:5805924, netWorth:102286790 },
];

const YEARLY_TAM = [
  { year:2019, tam:377486 }, { year:2020, tam:378952 }, { year:2021, tam:388318 },
  { year:2022, tam:390265 }, { year:2023, tam:400868 }, { year:2024, tam:414872 },
];

const YEARS = [2019,2020,2021,2022,2023,2024];

// ═══════════════════════════════════════════════════════════════
// SCORING — computed at load
// ═══════════════════════════════════════════════════════════════
function computeScores(schools) {
  const norm = (arr) => {
    const mn = Math.min(...arr), mx = Math.max(...arr), r = mx - mn || 1;
    return arr.map(v => ((v - mn) / r) * 100);
  };
  const tams = schools.map(s => s.tam);
  const yoys = schools.map(s => {
    const t = s.trend; return t.length >= 2 ? ((t[t.length-1] - t[t.length-2]) / t[t.length-2]) * 100 : 0;
  });
  const incomes = schools.map(s => s.income);
  const maxInc = Math.max(...incomes);
  const needs = incomes.map(i => maxInc - i);
  const ages = schools.map(s => s.age);
  const maxAge = Math.max(...ages);
  const freshness = ages.map(a => maxAge - a);

  const sizeN = norm(tams), growN = norm(yoys), needN = norm(needs), freshN = norm(freshness);
  return schools.map((s, i) => {
    const score = Math.round(sizeN[i]*0.4 + growN[i]*0.2 + needN[i]*0.2 + freshN[i]*0.2);
    const tier = score > 66 ? 1 : score > 33 ? 2 : 3;
    return { ...s, score, tier, sizeS: Math.round(sizeN[i]), growS: Math.round(growN[i]), needS: Math.round(needN[i]), freshS: Math.round(freshN[i]) };
  }).sort((a,b) => b.score - a.score);
}

const DATA = computeScores(SCHOOLS);
const TOTAL_TAM = DATA.reduce((s,d) => s + d.tam, 0);
const MEMBERS_2024 = 56372;
const PEN_PCT = ((MEMBERS_2024 / TOTAL_TAM) * 100).toFixed(1);

// ═══════════════════════════════════════════════════════════════
// UCU BRAND PALETTE — extracted from ucu.org
// ═══════════════════════════════════════════════════════════════
const P = {
  ink: "#0C2340",     // deep navy — primary
  ocean: "#006A8E",   // teal — secondary
  sky: "#4DA8DA",     // bright blue — accent
  sun: "#E8A838",     // warm gold — highlight
  leaf: "#2D8659",    // green — positive
  cloud: "#F5F7FA",   // off-white bg
  ash: "#8C96A4",     // muted text
  bone: "#FFFFFF",
  slate: "#3A4555",   // body text
};

const TIER = {
  1: { label:"Prioritize", color: P.leaf, bg:"#EBF5F0", border:"#B8DFCA" },
  2: { label:"Grow", color: P.ocean, bg:"#E8F4F8", border:"#B3D9E8" },
  3: { label:"Maintain", color: P.ash, bg: P.cloud, border:"#D4D9E0" },
};

// ═══════════════════════════════════════════════════════════════
// MICRO-COMPONENTS
// ═══════════════════════════════════════════════════════════════
const fmt = (n) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(0)}M` : n >= 1e3 ? n.toLocaleString() : n;

function Spark({ data, color, w=72, h=24 }) {
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-mn)/r)*(h-4)-2}`).join(" ");
  const last = data[data.length - 1];
  const ly = h - ((last - mn) / r) * (h - 4) - 2;
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
    <span style={{fontSize:10,color:P.ash,fontVariantNumeric:"tabular-nums",minWidth:18}}>{value}</span>
  </div>;
}

function Kpi({ label, value, sub, accent }) {
  return <div style={{background:P.bone,borderRadius:8,padding:"16px 20px",border:"1px solid #E8ECF1",flex:1,minWidth:140}}>
    <div style={{fontSize:10,color:P.ash,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2,fontFamily:"'IBM Plex Mono', monospace"}}>{label}</div>
    <div style={{fontSize:24,fontWeight:700,color:accent||P.ink,lineHeight:1.2,fontFamily:"'Libre Franklin', sans-serif"}}>{value}</div>
    {sub && <div style={{fontSize:11,color:P.ash,marginTop:2}}>{sub}</div>}
  </div>;
}

function NcuaLineChart({ data, field, label, color, formatter }) {
  const vals = data.map(d => d[field]);
  const mn = Math.min(...vals)*0.95, mx = Math.max(...vals)*1.02, r = mx-mn||1;
  const W=280, H=120, px=36, py=12;
  return <div>
    <div style={{fontSize:11,fontWeight:600,color:P.slate,marginBottom:6,fontFamily:"'IBM Plex Mono', monospace"}}>{label}</div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:W}}>
      <defs><linearGradient id={`g_${field}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.12"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      {[0,0.25,0.5,0.75,1].map(p => {
        const y = py + (1-p)*(H-2*py);
        const v = mn + p*r;
        return <g key={p}><line x1={px} y1={y} x2={W-8} y2={y} stroke="#E8ECF1" strokeDasharray="3"/>
          <text x={px-4} y={y+3} textAnchor="end" fontSize="8" fill={P.ash}>{formatter(v)}</text></g>;
      })}
      <polygon points={data.map((d,i) => {
        const x = px + (i/(data.length-1))*(W-px-8);
        const y = py + (1-(d[field]-mn)/r)*(H-2*py);
        return `${x},${y}`;
      }).join(" ") + ` ${px+(data.length-1)/(data.length-1)*(W-px-8)},${H-py} ${px},${H-py}`} fill={`url(#g_${field})`}/>
      <polyline points={data.map((d,i) => {
        const x = px + (i/(data.length-1))*(W-px-8);
        const y = py + (1-(d[field]-mn)/r)*(H-2*py);
        return `${x},${y}`;
      }).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {data.map((d,i) => {
        const x = px + (i/(data.length-1))*(W-px-8);
        const y = py + (1-(d[field]-mn)/r)*(H-2*py);
        return <g key={i}><circle cx={x} cy={y} r="3" fill={P.bone} stroke={color} strokeWidth="1.5"/>
          <text x={x} y={H-2} textAnchor="middle" fontSize="8" fill={P.ash}>{d.year}</text></g>;
      })}
    </svg>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tierFilter, setTier] = useState("all");
  const [sortBy, setSort] = useState("score");
  const [view, setView] = useState("scorecard");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let d = [...DATA];
    if (tierFilter !== "all") d = d.filter(s => s.tier === parseInt(tierFilter));
    d.sort((a,b) => sortBy === "score" ? b.score-a.score : sortBy === "tam" ? b.tam-a.tam : a.age-b.age);
    return d;
  }, [tierFilter, sortBy]);

  const font = "'Libre Franklin', 'Helvetica Neue', sans-serif";
  const mono = "'IBM Plex Mono', 'SF Mono', monospace";

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
          <Kpi label="Total Addressable Market" value={TOTAL_TAM.toLocaleString()} sub="Students + staff, Fall 2024" accent={P.ink}/>
          <Kpi label="UCU Members" value={MEMBERS_2024.toLocaleString()} sub="Q4 2024, NCUA" accent={P.ocean}/>
          <Kpi label="Penetration" value={`${PEN_PCT}%`} sub={`${(TOTAL_TAM-MEMBERS_2024).toLocaleString()} untapped`} accent={P.sun}/>
          <Kpi label="Total Assets" value="$1.14B" sub="+53.5% since 2019" accent={P.leaf}/>
        </div>

        {/* ─── TABS ─── */}
        <div style={{display:"flex",gap:2,marginBottom:18,background:P.bone,borderRadius:6,padding:3,border:"1px solid #E8ECF1",width:"fit-content"}}>
          {[["scorecard","Scorecard"],["financials","UCU Financials"],["detail","School Detail"]].map(([k,l]) =>
            <button key={k} onClick={()=>setView(k)} style={{
              padding:"7px 18px",borderRadius:4,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:font,
              background:view===k?P.ink:"transparent",color:view===k?P.bone:P.ash,transition:"all 0.15s"
            }}>{l}</button>
          )}
        </div>

        {/* ═══════════ SCORECARD VIEW ═══════════ */}
        {view === "scorecard" && <>
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap",fontSize:11}}>
            <span style={{color:P.ash,fontWeight:600,fontFamily:mono}}>TIER</span>
            {[["all","All"],["1","T1"],["2","T2"],["3","T3"]].map(([v,l]) =>
              <button key={v} onClick={()=>setTier(v)} style={{
                padding:"4px 12px",borderRadius:4,border:`1px solid ${tierFilter===v?P.ink:"#D4D9E0"}`,
                background:tierFilter===v?P.ink:P.bone,color:tierFilter===v?P.bone:P.ash,cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font
              }}>{l}</button>
            )}
            <span style={{color:P.ash,fontWeight:600,fontFamily:mono,marginLeft:10}}>SORT</span>
            {[["score","Score"],["tam","TAM"],["age","Newest"]].map(([v,l]) =>
              <button key={v} onClick={()=>setSort(v)} style={{
                padding:"4px 12px",borderRadius:4,border:`1px solid ${sortBy===v?P.ocean:"#D4D9E0"}`,
                background:sortBy===v?"#E8F4F8":P.bone,color:sortBy===v?P.ocean:P.ash,cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font
              }}>{l}</button>
            )}
          </div>

          {/* Table */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:P.cloud,borderBottom:"2px solid #E8ECF1"}}>
                  {["University","Tier","TAM","Trend","Size","Growth","Need","Fresh","Score"].map(h =>
                    <th key={h} style={{textAlign:h==="University"?"left":"center",padding:"10px 12px",fontWeight:600,color:P.ash,fontSize:9,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:mono}}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const tc = TIER[s.tier];
                  return <tr key={s.name} onClick={()=>{setSelected(s);setView("detail")}}
                    style={{borderBottom:"1px solid #F0F2F5",cursor:"pointer",transition:"background 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#FAFBFC"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{padding:"12px 12px"}}>
                      <div style={{fontWeight:600,color:P.ink,fontSize:12}}>{s.name}</div>
                      <div style={{fontSize:10,color:P.ash}}>{s.state} · {s.conf} · {s.age}yr</div>
                    </td>
                    <td style={{textAlign:"center",padding:"12px 6px"}}>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:tc.bg,color:tc.color,border:`1px solid ${tc.border}`}}>T{s.tier}</span>
                    </td>
                    <td style={{textAlign:"right",padding:"12px 6px",fontWeight:600,fontVariantNumeric:"tabular-nums",fontFamily:mono,fontSize:11}}>{s.tam.toLocaleString()}</td>
                    <td style={{textAlign:"center",padding:"12px 6px"}}><div style={{display:"flex",justifyContent:"center"}}><Spark data={s.trend} color={tc.color}/></div></td>
                    <td style={{padding:"12px 6px"}}><Bar value={s.sizeS} color={P.ink}/></td>
                    <td style={{padding:"12px 6px"}}><Bar value={s.growS} color={P.ocean}/></td>
                    <td style={{padding:"12px 6px"}}><Bar value={s.needS} color={P.sun}/></td>
                    <td style={{padding:"12px 6px"}}><Bar value={s.freshS} color={P.leaf}/></td>
                    <td style={{textAlign:"center",padding:"12px 12px"}}><div style={{fontSize:18,fontWeight:800,color:tc.color}}>{s.score}</div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>

          {/* Methodology */}
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

        {/* ═══════════ FINANCIALS VIEW ═══════════ */}
        {view === "financials" && <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* NCUA Charts */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaLineChart data={NCUA} field="members" label="MEMBERS" color={P.ink} formatter={v=>`${(v/1000).toFixed(0)}K`}/>
            </div>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaLineChart data={NCUA} field="assets" label="TOTAL ASSETS" color={P.ocean} formatter={v=>`$${(v/1e9).toFixed(1)}B`}/>
            </div>
            <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:16}}>
              <NcuaLineChart data={NCUA} field="loans" label="TOTAL LOANS" color={P.sun} formatter={v=>`$${(v/1e6).toFixed(0)}M`}/>
            </div>
          </div>

          {/* Growth summary */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,fontFamily:mono}}>5-Year Growth (2019→2024)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[
                {l:"Members",v0:"41,066",v1:"56,372",pct:"+37.3%",c:P.ink},
                {l:"Assets",v0:"$740M",v1:"$1.14B",pct:"+53.5%",c:P.ocean},
                {l:"Loans",v0:"$406M",v1:"$949M",pct:"+133.5%",c:P.sun},
                {l:"Net Worth",v0:"$65M",v1:"$102M",pct:"+57.1%",c:P.leaf},
              ].map(m => <div key={m.l} style={{padding:12,background:P.cloud,borderRadius:6}}>
                <div style={{fontSize:10,color:P.ash,fontFamily:mono}}>{m.l}</div>
                <div style={{fontSize:10,color:P.ash,marginTop:4}}>{m.v0} →</div>
                <div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v1}</div>
                <div style={{fontSize:12,fontWeight:700,color:m.c,marginTop:2}}>{m.pct}</div>
              </div>)}
            </div>
          </div>

          {/* Penetration trend */}
          <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:20}}>
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14,fontFamily:mono}}>Penetration Trend — Members vs. Addressable Market</div>
            <div style={{display:"flex",alignItems:"end",gap:6,height:140,padding:"0 8px"}}>
              {YEARLY_TAM.map((yt,i) => {
                const n = NCUA[i];
                const pen = ((n.members/yt.tam)*100).toFixed(1);
                const barH = 100;
                const tamH = barH;
                const memH = (n.members/yt.tam)*barH;
                return <div key={yt.year} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#C0392B",marginBottom:4}}>{pen}%</div>
                  <div style={{position:"relative",height:barH,background:"#E8ECF1",borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
                    <div style={{position:"absolute",bottom:0,width:"100%",height:`${memH}%`,background:P.ink,borderRadius:"4px 4px 0 0",transition:"height 0.3s"}}/>
                  </div>
                  <div style={{fontSize:9,color:P.ash,marginTop:4,fontFamily:mono}}>{yt.year}</div>
                </div>;
              })}
            </div>
            <div style={{display:"flex",gap:16,marginTop:12,fontSize:10,color:P.ash}}>
              <span><span style={{display:"inline-block",width:8,height:8,background:P.ink,borderRadius:2,marginRight:4}}/>UCU Members</span>
              <span><span style={{display:"inline-block",width:8,height:8,background:"#E8ECF1",borderRadius:2,marginRight:4}}/>Total Addressable Market</span>
            </div>
            <p style={{fontSize:12,color:P.ash,marginTop:12,lineHeight:1.6}}>
              A 5-point penetration increase (to ~{(parseFloat(PEN_PCT)+5).toFixed(0)}%) = approximately <b style={{color:P.ink}}>{Math.round(TOTAL_TAM*0.05).toLocaleString()} new member-owners</b>, translating to significant deposit growth, loan originations, and community impact.
            </p>
          </div>
        </div>}

        {/* ═══════════ DETAIL VIEW ═══════════ */}
        {view === "detail" && <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {DATA.map(s => <button key={s.name} onClick={()=>setSelected(s)} style={{
              padding:"4px 10px",borderRadius:6,border:`1px solid ${selected?.name===s.name?TIER[s.tier].color:"#D4D9E0"}`,
              background:selected?.name===s.name?TIER[s.tier].bg:P.bone,color:selected?.name===s.name?TIER[s.tier].color:P.ash,
              cursor:"pointer",fontSize:11,fontWeight:500,fontFamily:font
            }}>{s.name}</button>)}
          </div>

          {selected ? <div style={{background:P.bone,borderRadius:8,border:"1px solid #E8ECF1",padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:800,margin:0,color:P.ink,letterSpacing:"-0.01em"}}>{selected.name}</h2>
                <p style={{fontSize:12,color:P.ash,margin:"4px 0 0"}}>{selected.state} · {selected.conf} · {selected.type} · Partner since {2024-selected.age}</p>
              </div>
              <div style={{textAlign:"center",padding:"6px 14px",background:TIER[selected.tier].bg,borderRadius:8,border:`1px solid ${TIER[selected.tier].border}`}}>
                <div style={{fontSize:24,fontWeight:800,color:TIER[selected.tier].color}}>{selected.score}</div>
                <div style={{fontSize:9,color:TIER[selected.tier].color,fontWeight:600,fontFamily:mono}}>{TIER[selected.tier].label}</div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {[{l:"Addressable Pop.",v:selected.tam.toLocaleString(),c:P.ink},{l:"Enrollment",v:selected.enroll.toLocaleString(),c:P.ocean},
                {l:"Staff",v:selected.staff.toLocaleString(),c:P.leaf},{l:"Median Income",v:`$${(selected.income/1000).toFixed(0)}K`,c:P.sun}
              ].map(m => <div key={m.l} style={{padding:12,background:P.cloud,borderRadius:6}}>
                <div style={{fontSize:9,color:P.ash,fontFamily:mono}}>{m.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div>
              </div>)}
            </div>

            {/* Score breakdown circles */}
            <div style={{fontSize:9,fontWeight:600,color:P.ash,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,fontFamily:mono}}>Score Breakdown</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
              {[{l:"Market Size",v:selected.sizeS,w:"40%",c:P.ink},{l:"Growth",v:selected.growS,w:"20%",c:P.ocean},
                {l:"Financial Need",v:selected.needS,w:"20%",c:P.sun},{l:"Freshness",v:selected.freshS,w:"20%",c:P.leaf}
              ].map(comp => <div key={comp.l} style={{textAlign:"center"}}>
                <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${comp.c}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px",background:P.bone}}>
                  <span style={{fontSize:16,fontWeight:800,color:comp.c}}>{comp.v}</span>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:P.slate}}>{comp.l}</div>
                <div style={{fontSize:9,color:P.ash,fontFamily:mono}}>{comp.w}</div>
              </div>)}
            </div>

            {/* Enrollment trend */}
            <div style={{marginTop:20,padding:14,background:P.cloud,borderRadius:6}}>
              <div style={{fontSize:9,fontWeight:600,color:P.ash,fontFamily:mono,marginBottom:8}}>FALL ENROLLMENT 2019–2024</div>
              <div style={{display:"flex",alignItems:"end",gap:6,height:70}}>
                {selected.trend.map((v,i) => {
                  const mx = Math.max(...selected.trend), mn = Math.min(...selected.trend)*0.9;
                  const h = ((v-mn)/(mx-mn))*60+10;
                  return <div key={i} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:9,color:P.ash,marginBottom:2,fontFamily:mono}}>{(v/1000).toFixed(1)}K</div>
                    <div style={{height:h,background:i===selected.trend.length-1?TIER[selected.tier].color:"#D4D9E0",borderRadius:"3px 3px 0 0",transition:"height 0.3s"}}/>
                    <div style={{fontSize:9,color:P.ash,marginTop:3,fontFamily:mono}}>{YEARS[i]}</div>
                  </div>;
                })}
              </div>
            </div>
          </div> : <div style={{textAlign:"center",padding:40,color:P.ash,background:P.bone,borderRadius:8,border:"1px solid #E8ECF1"}}>Select a school above</div>}
        </div>}

        {/* ─── FOOTER ─── */}
        <div style={{marginTop:28,padding:"12px 0",borderTop:"1px solid #E8ECF1",textAlign:"center",fontSize:10,color:P.ash,fontFamily:mono}}>
          Pranav Piedy · UCLA Anderson MSBA '26 · Sources: IPEDS (NCES), NCUA 5300 Call Reports, U.S. Census Bureau
        </div>
      </div>
    </div>
  );
}
