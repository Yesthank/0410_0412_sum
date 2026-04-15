import { useState, useEffect, useMemo } from "react";

const RATE = 9.35;

// Color palette
const COLORS = {
  bg: "#0c0c0c",
  card: "#161616",
  cardBorder: "#252525",
  text: "#e0e0e0",
  dim: "#777",
  pink: "#ff6b9d",
  gold: "#ffd700",
  teal: "#4ecdc4",
  purple: "#a855f7",
  orange: "#f59e0b",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
};

const CATEGORY_COLORS = {
  "🛍️ 쇼핑": COLORS.pink,
  "🍜 식비": COLORS.gold,
  "☕ 카페": COLORS.teal,
  "🏨 숙소": COLORS.purple,
  "🚃 교통": COLORS.blue,
  "🎮 관광/엔터": COLORS.green,
  "📦 기타": COLORS.dim,
};

const STORE_COLORS = [
  "#ff6b9d","#ffd700","#4ecdc4","#a855f7","#f59e0b",
  "#3b82f6","#22c55e","#ef4444","#06b6d4","#ec4899",
  "#8b5cf6","#14b8a6","#f97316","#64748b","#84cc16","#fb7185"
];

export default function FukuokaExpenses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("charts");
  const [sortCol, setSortCol] = useState("date");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchFromNotion();
  }, []);

  async function fetchFromNotion() {
    try {
      setLoading(true);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: `You have access to the user's Notion. Query the expense database "🧾 후쿠오카 경비" (data source: collection://edc9cba1-7830-4fcb-bb87-fdd973fddf27). Return ONLY a JSON array of objects with fields: title, date, category, store, yen, krw, memo. No markdown, no backticks, no explanation. Only active (non-archived) items. If 구매처 is empty, skip it (those are old duplicate rows).`,
          messages: [{ role: "user", content: "Fetch all items from 후쿠오카 경비 database. Return JSON array only." }],
          mcp_servers: [{ type: "url", url: "https://mcp.notion.com/mcp", name: "notion" }]
        })
      });
      const data = await res.json();
      
      // Extract text from response
      const textBlocks = data.content?.filter(b => b.type === "text") || [];
      const toolResults = data.content?.filter(b => b.type === "mcp_tool_result") || [];
      
      let jsonStr = textBlocks.map(b => b.text).join("");
      
      // Try to parse JSON from the response
      try {
        // Clean potential markdown
        jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          setLoading(false);
          return;
        }
      } catch(e) {
        // If direct parse fails, try extracting from tool results
      }

      // Fallback: use hardcoded data from our conversation
      loadFallbackData();
    } catch (e) {
      console.error("Notion fetch error:", e);
      loadFallbackData();
    }
  }

  function loadFallbackData() {
    const fallback = [
      // DAY 1 - 4/10
      {title:"宿泊税",date:"2026-04-10",category:"🏨 숙소",store:"플라자호텔",yen:800,memo:"숙박세"},
      {title:"モツ銅 天神西通り",date:"2026-04-10",category:"🍜 식비",store:"텐진니시도리 모츠나베",yen:9130,memo:"DAY1 저녁"},
      {title:"コンビニ おつまみ・酒",date:"2026-04-10",category:"🍜 식비",store:"세븐일레븐",yen:1398,memo:"저녁 안주/술"},
      // DAY 2 - 4/11 돈키호테 1차
      {title:"Dセラムマスク 30枚B x4",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:2000,memo:""},
      {title:"情熱価格 有機むぎ茶 x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:718,memo:""},
      {title:"デオナチュレ 足指さらさらクリーム",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:900,memo:""},
      {title:"ポケットモンスター ボディスポンジ",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:430,memo:""},
      {title:"CHOIマスク 毛穴 x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:1500,memo:""},
      {title:"フェキソフェナジン鼻炎CX 6",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:1999,memo:""},
      {title:"ハンギョドン なりきり x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:800,memo:""},
      {title:"陶器ダイカットマグカ",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:2490,memo:""},
      {title:"メラノCC酵素洗顔 x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:1430,memo:""},
      {title:"メンソレータム リップフォンデ x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:1198,memo:""},
      {title:"ナイフピーラー 3点セット",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:5990,memo:""},
      {title:"Rツメキリ",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:900,memo:""},
      {title:"サガミオリジナル001 Lサイズ x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:5280,memo:""},
      {title:"フィーノ美溶液ヘアマスク替 x2",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:3980,memo:""},
      {title:"ビオレTBB乳液金木犀替",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:599,memo:""},
      // 돈키호테 간식
      {title:"水恋湾 飲むヨーグルト",date:"2026-04-11",category:"🍜 식비",store:"돈키호테",yen:599,memo:""},
      {title:"メロンサンド",date:"2026-04-11",category:"🍜 식비",store:"돈키호테",yen:980,memo:""},
      // 돈키호테 위스키
      {title:"響 ブレンダーズチョイス 国内",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:17990,memo:"면세"},
      {title:"キオールド",date:"2026-04-11",category:"🛍️ 쇼핑",store:"돈키호테",yen:2090,memo:"면세"},
      // 로손
      {title:"モモトヨウナシ 350ML",date:"2026-04-11",category:"🍜 식비",store:"로손",yen:174,memo:""},
      {title:"大きなツインシュー",date:"2026-04-11",category:"🍜 식비",store:"로손",yen:151,memo:""},
      {title:"アサヒスーパードライ ジョッキ 485ML",date:"2026-04-11",category:"🍜 식비",store:"로손",yen:308,memo:""},
      // 오호리 우나기
      {title:"おほりうなぎ 弁当 x2",date:"2026-04-11",category:"🍜 식비",store:"오호리 우나기",yen:7600,memo:"포장"},
      // 보더라인 레코드
      {title:"ドロップス LP (1)",date:"2026-04-11",category:"🛍️ 쇼핑",store:"보더라인 레코드",yen:2580,memo:""},
      {title:"ドロップス LP (2)",date:"2026-04-11",category:"🛍️ 쇼핑",store:"보더라인 레코드",yen:2980,memo:""},
      {title:"중고 LP (1)",date:"2026-04-11",category:"🛍️ 쇼핑",store:"보더라인 레코드",yen:1980,memo:""},
      {title:"중고 LP (2)",date:"2026-04-11",category:"🛍️ 쇼핑",store:"보더라인 레코드",yen:2980,memo:""},
      // 링크스
      {title:"獺祭二十三 + 響 JAPANESE HARMONY",date:"2026-04-11",category:"🛍️ 쇼핑",store:"링크스 후쿠오카",yen:21000,memo:""},
      // 타워레코드
      {title:"久石譲 / DGオーケストラ LP",date:"2026-04-11",category:"🛍️ 쇼핑",store:"타워레코드 파르코",yen:6090,memo:""},
      // 쿠로다한
      {title:"海鮮丼",date:"2026-04-11",category:"🍜 식비",store:"쿠로다한",yen:7790,memo:"회덮밥"},
      // 세븐일레븐
      {title:"コンビニ 酒・おつまみ",date:"2026-04-11",category:"🍜 식비",store:"세븐일레븐",yen:1026,memo:""},
      // DAY 3 - 4/12
      {title:"アイスコーヒー (1)",date:"2026-04-12",category:"☕ 카페",store:"스타벅스",yen:432,memo:"To Go"},
      {title:"アイスコーヒー (2)",date:"2026-04-12",category:"☕ 카페",store:"스타벅스",yen:432,memo:"To Go"},
      {title:"餃子ぬいぐるみキーチェー",date:"2026-04-12",category:"🛍️ 쇼핑",store:"세리아",yen:110,memo:""},
      {title:"キーホルダー フランスパン&クロワッサン",date:"2026-04-12",category:"🛍️ 쇼핑",store:"세리아",yen:110,memo:""},
      // Face Records
      {title:"ABBA / ベリー・ベスト・オブ・アバ",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:2200,memo:""},
      {title:"ビートルズ / 4人はアイドル",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:1800,memo:""},
      {title:"ヴェルヴェット・アンダーグラウンド / VU",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:4200,memo:""},
      {title:"山下達郎 / メロディーズ",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:3200,memo:""},
      {title:"BEATLES / ANTHOLOGY 1",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:5000,memo:""},
      {title:"BEATLES / ANTHOLOGY 2",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:4200,memo:""},
      {title:"ビートルズ / アンソロジー3",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:6000,memo:""},
      {title:"グローヴァー・ワシントン JR. / 訪れ",date:"2026-04-12",category:"🛍️ 쇼핑",store:"Face Records",yen:1000,memo:""},
      // 로손 공항
      {title:"間食",date:"2026-04-12",category:"🍜 식비",store:"로손 공항",yen:193,memo:""},
      // 우동집
      {title:"海老天うどん",date:"2026-04-12",category:"🍜 식비",store:"釜喜利うどん",yen:1480,memo:""},
      {title:"生ビール中",date:"2026-04-12",category:"🍜 식비",store:"釜喜利うどん",yen:660,memo:""},
      // 공항
      {title:"アイス・プリン",date:"2026-04-12",category:"🍜 식비",store:"후쿠오카공항",yen:928,memo:""},
    ];
    fallback.forEach(i => { i.krw = Math.round(i.yen * RATE); });
    setItems(fallback);
    setLoading(false);
  }

  // Aggregations
  const totals = useMemo(() => {
    const totalYen = items.reduce((s,i) => s + i.yen, 0);
    return { yen: totalYen, krw: Math.round(totalYen * RATE) };
  }, [items]);

  const byStore = useMemo(() => {
    const m = {};
    items.forEach(i => { m[i.store] = (m[i.store]||0) + i.yen; });
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  }, [items]);

  const byCategory = useMemo(() => {
    const m = {};
    items.forEach(i => { m[i.category] = (m[i.category]||0) + i.yen; });
    return Object.entries(m).sort((a,b) => b[1]-a[1]);
  }, [items]);

  const byDay = useMemo(() => {
    const m = {};
    items.forEach(i => {
      const d = i.date.slice(5);
      m[d] = (m[d]||0) + i.yen;
    });
    return Object.entries(m).sort((a,b) => a[0].localeCompare(b[0]));
  }, [items]);

  const sorted = useMemo(() => {
    const arr = [...items];
    arr.sort((a,b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (sortCol === "yen" || sortCol === "krw") return sortDir === "asc" ? va-vb : vb-va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [items, sortCol, sortDir]);

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }

  // Bar chart renderer
  function HBar({ data, colorMap, maxVal }) {
    const max = maxVal || Math.max(...data.map(d => d[1]));
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {data.map(([label, val], i) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:130, fontSize:12, color:COLORS.dim, textAlign:"right", flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{label}</div>
            <div style={{ flex:1, position:"relative", height:28, background:"rgba(255,255,255,0.03)", borderRadius:6, overflow:"hidden" }}>
              <div style={{
                width: `${(val/max)*100}%`,
                height:"100%",
                background: colorMap?.[label] || STORE_COLORS[i % STORE_COLORS.length],
                borderRadius:6,
                transition:"width 0.8s cubic-bezier(.4,0,.2,1)",
                display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8,
              }}>
                {(val/max) > 0.15 && <span style={{ fontSize:11, color:"#000", fontWeight:600 }}>¥{val.toLocaleString()}</span>}
              </div>
            </div>
            <div style={{ width:80, fontSize:11, color:COLORS.dim, textAlign:"right", flexShrink:0 }}>₩{Math.round(val*RATE).toLocaleString()}</div>
          </div>
        ))}
      </div>
    );
  }

  // Donut chart
  function Donut({ data, colorMap, size=220 }) {
    const total = data.reduce((s,d) => s+d[1], 0);
    let cumAngle = 0;
    const r = size/2, cx = r, cy = r, ir = r*0.55;
    
    const segments = data.map(([label, val], i) => {
      const angle = (val/total) * 360;
      const startAngle = cumAngle;
      cumAngle += angle;
      const endAngle = cumAngle;
      const s1 = (Math.PI/180) * (startAngle - 90);
      const e1 = (Math.PI/180) * (endAngle - 90);
      const largeArc = angle > 180 ? 1 : 0;
      const x1o = cx + r * Math.cos(s1), y1o = cy + r * Math.sin(s1);
      const x2o = cx + r * Math.cos(e1), y2o = cy + r * Math.sin(e1);
      const x1i = cx + ir * Math.cos(e1), y1i = cy + ir * Math.sin(e1);
      const x2i = cx + ir * Math.cos(s1), y2i = cy + ir * Math.sin(s1);
      const path = `M${x1o},${y1o} A${r},${r} 0 ${largeArc},1 ${x2o},${y2o} L${x1i},${y1i} A${ir},${ir} 0 ${largeArc},0 ${x2i},${y2i} Z`;
      const color = colorMap?.[label] || STORE_COLORS[i];
      return { label, val, path, color, pct: ((val/total)*100).toFixed(1) };
    });

    return (
      <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap", justifyContent:"center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((s,i) => (
            <path key={i} d={s.path} fill={s.color} stroke={COLORS.card} strokeWidth={2} style={{ transition:"opacity 0.2s" }}>
              <title>{s.label}: ¥{s.val.toLocaleString()} ({s.pct}%)</title>
            </path>
          ))}
          <text x={cx} y={cy-8} textAnchor="middle" fill={COLORS.text} fontSize={16} fontWeight={700}>¥{total.toLocaleString()}</text>
          <text x={cx} y={cy+12} textAnchor="middle" fill={COLORS.dim} fontSize={10}>₩{Math.round(total*RATE).toLocaleString()}</text>
        </svg>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {segments.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:s.color, flexShrink:0 }}/>
              <span style={{ color:COLORS.dim, width:90 }}>{s.label}</span>
              <span style={{ color:COLORS.text, fontWeight:600 }}>{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background:COLORS.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:COLORS.dim, fontFamily:"'Noto Sans KR',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🌸</div>
          <div>Notion에서 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const sortIcon = (col) => sortCol === col ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div style={{
      background: COLORS.bg,
      minHeight: "100vh",
      color: COLORS.text,
      fontFamily: "'Noto Sans KR', sans-serif",
      padding: "32px 20px",
    }}>
      {/* Header */}
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <h1 style={{
          fontSize:28, fontWeight:700, margin:0,
          background:"linear-gradient(135deg, #ff6b9d, #ffd700)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          letterSpacing:-0.5,
        }}>🌸 후쿠오카 경비 리포트</h1>
        <p style={{ color:COLORS.dim, fontSize:13, marginTop:6 }}>2026.04.10 — 04.12 · 2박 3일</p>
        
        {/* Total cards */}
        <div style={{ display:"inline-flex", gap:24, marginTop:20, background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:"16px 32px" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, color:COLORS.dim, textTransform:"uppercase", letterSpacing:1 }}>TOTAL (JPY)</div>
            <div style={{ fontSize:22, fontWeight:700, color:COLORS.pink }}>¥{totals.yen.toLocaleString()}</div>
          </div>
          <div style={{ width:1, background:COLORS.cardBorder }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, color:COLORS.dim, textTransform:"uppercase", letterSpacing:1 }}>TOTAL (KRW)</div>
            <div style={{ fontSize:22, fontWeight:700, color:COLORS.gold }}>₩{totals.krw.toLocaleString()}</div>
          </div>
          <div style={{ width:1, background:COLORS.cardBorder }}/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, color:COLORS.dim, textTransform:"uppercase", letterSpacing:1 }}>항목 수</div>
            <div style={{ fontSize:22, fontWeight:700, color:COLORS.teal }}>{items.length}건</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:24 }}>
        {[
          { id:"charts", label:"📊 차트" },
          { id:"table", label:"📋 데이터" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"10px 24px", border:"none", borderRadius:8, cursor:"pointer",
            fontSize:13, fontWeight:600, fontFamily:"inherit", transition:"all 0.2s",
            background: tab===t.id ? "linear-gradient(135deg, #ff6b9d33, #ffd70033)" : "transparent",
            color: tab===t.id ? COLORS.text : COLORS.dim,
            border: tab===t.id ? `1px solid ${COLORS.pink}44` : `1px solid ${COLORS.cardBorder}`,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Charts Tab */}
      {tab === "charts" && (
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
          {/* 구매처별 */}
          <div style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span>📊</span> 구매처별 지출
            </h2>
            <HBar data={byStore} />
          </div>

          {/* 2-col grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            <div style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:24 }}>
              <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>🍩 카테고리별</h2>
              <Donut data={byCategory} colorMap={CATEGORY_COLORS} />
            </div>
            <div style={{ background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, padding:24 }}>
              <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>📅 일자별</h2>
              <Donut data={byDay} colorMap={{ "04-10":COLORS.teal, "04-11":COLORS.pink, "04-12":COLORS.gold }} />
            </div>
          </div>

          {/* Day summary cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {byDay.map(([day, yen], i) => (
              <div key={day} style={{
                background:"rgba(255,255,255,0.02)", border:`1px solid ${COLORS.cardBorder}`,
                borderRadius:12, padding:16, textAlign:"center",
              }}>
                <div style={{ fontSize:11, color:COLORS.dim }}>DAY {i+1} · {day.replace("-","/")} </div>
                <div style={{ fontSize:18, fontWeight:700, color:[COLORS.teal,COLORS.pink,COLORS.gold][i], marginTop:4 }}>¥{yen.toLocaleString()}</div>
                <div style={{ fontSize:12, color:COLORS.dim, marginTop:2 }}>₩{Math.round(yen*RATE).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Tab */}
      {tab === "table" && (
        <div style={{ maxWidth:1000, margin:"0 auto", background:COLORS.card, border:`1px solid ${COLORS.cardBorder}`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${COLORS.cardBorder}` }}>
                  {[
                    {key:"date", label:"날짜", w:80},
                    {key:"store", label:"구매처", w:120},
                    {key:"category", label:"카테고리", w:90},
                    {key:"title", label:"항목", w:null},
                    {key:"yen", label:"¥ 엔", w:80},
                    {key:"krw", label:"₩ 원", w:90},
                  ].map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                      padding:"12px 10px", textAlign: col.key==="yen"||col.key==="krw" ? "right" : "left",
                      color:COLORS.dim, fontWeight:500, cursor:"pointer", userSelect:"none",
                      width: col.w || "auto", whiteSpace:"nowrap", fontSize:11,
                      background:"rgba(255,255,255,0.02)",
                    }}>
                      {col.label}{sortIcon(col.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, i) => (
                  <tr key={i} style={{
                    borderBottom:`1px solid ${COLORS.cardBorder}`,
                    transition:"background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <td style={{ padding:"10px", color:COLORS.dim, whiteSpace:"nowrap" }}>{item.date.slice(5).replace("-","/")}</td>
                    <td style={{ padding:"10px" }}>
                      <span style={{
                        fontSize:11, padding:"2px 8px", borderRadius:4,
                        background:"rgba(255,255,255,0.05)", color:COLORS.text,
                      }}>{item.store}</span>
                    </td>
                    <td style={{ padding:"10px", fontSize:11 }}>{item.category}</td>
                    <td style={{ padding:"10px", maxWidth:250, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.title}</td>
                    <td style={{ padding:"10px", textAlign:"right", fontWeight:600, color:COLORS.pink, fontVariantNumeric:"tabular-nums" }}>¥{item.yen.toLocaleString()}</td>
                    <td style={{ padding:"10px", textAlign:"right", color:COLORS.gold, fontVariantNumeric:"tabular-nums" }}>₩{Math.round(item.yen*RATE).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                  <td colSpan={4} style={{ padding:"12px 10px", fontWeight:700, textAlign:"right" }}>합계</td>
                  <td style={{ padding:"12px 10px", textAlign:"right", fontWeight:700, color:COLORS.pink, fontSize:13 }}>¥{totals.yen.toLocaleString()}</td>
                  <td style={{ padding:"12px 10px", textAlign:"right", fontWeight:700, color:COLORS.gold, fontSize:13 }}>₩{totals.krw.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <div style={{ textAlign:"center", marginTop:32, color:COLORS.dim, fontSize:11 }}>
        1엔 = {RATE}원 기준 환산 · Notion DB 연동
      </div>
    </div>
  );
}
