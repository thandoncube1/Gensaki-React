// src/pages/FitScore.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

// ─── Palettes ─────────────────────────────────────────────────────────────────

const B = {
  bg:   '#F7FAFC', card: '#FFFFFF', p:  '#121C29', s:  '#59697A',
  bd:   '#E8EDF2', bl:  '#1C63FA', gr: '#00AD47', am: '#D98C00',
  rd:   '#CC2626', pu:  '#A64DCC',
};

const C = {
  bg:    '#FBFBF8', ink: '#0E1410', ink2: '#2A312D', mute: '#6B7368',
  line:  '#E6E8E2', green: '#2F9E69', mint1: '#E7F6EC', mint2: '#F1FBF3',
};

const ff   = (v: 'geist' | 'mono') =>
  v === 'geist' ? '"Geist", system-ui, sans-serif' : '"JetBrains Mono", "Courier New", monospace';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuitForm {
  institution: string; jurisdiction: string; assets: string; capital: string;
  portfolio: string;   portfolioSize: string; goal: string; quality: string; explored: string;
}

interface Opportunity {
  score:       number;
  label:       string;
  color:       string;
  reasonsHigh: string[];
  poolExplain: string;
  directions:  { h: string; s: string }[];
  questions:   string[];
}

interface AltOption { name: string; capital: string; speed: string; cost: string; client: string; complexity: string; vsSRT: string; }

type LookupConf = 'high' | 'medium' | 'low';
interface InstitutionResult {
  id: string; name: string; institutionType: string; jurisdiction: string;
  ticker: string; lei: string; assetsM: string; capitalPct: string;
  likelyPortfolio: string; portfolioSizeM: string; creditQuality: string;
  sourceLabel: string; sourceDate: string; confidence: LookupConf; prefillSummary: string;
}

type Step = 'landing' | 'persona' | 'mode' | 'institutionSearch' | 'form' | 'loading' | 'results';
type ActiveSheet = 'bankQuote' | 'investorEOI' | 'partnerEOI' | null;

// ─── OS namespace ─────────────────────────────────────────────────────────────

const emptyForm: SuitForm = { institution:'', jurisdiction:'', assets:'', capital:'', portfolio:'', portfolioSize:'', goal:'', quality:'', explored:'' };

function parseNum(s: string) { return parseFloat(s.replace(/[,% \t]/g, '')) || 0; }

function fmtM(v: number) {
  const neg = v < 0, n = Math.abs(v);
  const digits = n >= 10 ? Math.round(n).toLocaleString('en-US') : n.toFixed(1);
  return (neg ? '-$' : '$') + digits + 'M';
}
function pctPt(v: number) { return Number.isInteger(v) ? v + '%' : v.toFixed(1) + '%'; }
function formFilled(f: SuitForm) {
  return [f.institution,f.jurisdiction,f.assets,f.capital,f.portfolio,f.portfolioSize,f.goal,f.quality,f.explored].filter(s=>s!=='').length;
}

const OS = {
  personas: [
    { id:'investor', label:'SRT Investor',              sub:'Credit fund, pension allocator, insurer or family office assessing SRT deal flow.' },
    { id:'bank',     label:'Bank or Credit Union',      sub:'Originator considering whether SRT may be relevant for capital efficiency or growth.' },
    { id:'advisor',  label:'Lawyer, Accountant, or Advisor', sub:'Advisory professional scoping SRT relevance for a client mandate.' },
    { id:'reporter', label:'Reporter or Researcher',    sub:'Journalist or analyst covering bank capital, private credit, or risk transfer.' },
  ],

  modes: [
    { id:'lookup',  label:'Look up an institution',      body:'Search by name, ticker, or LEI. We pull public balance-sheet structure and capital data.',       cta:'Search',           recommended: false },
    { id:'quick',   label:'Enter quick portfolio details', body:'A short, lightweight form. The fastest way to see a directional read on SRT relevance.',       cta:'Open form',        recommended: true  },
    { id:'example', label:'Explore an example',           body:'Walk through a fully-populated illustrative Opportunity Card with sample data.',                 cta:'See example',      recommended: false },
  ],

  institutionTypes: ['Bank', 'Credit Union', 'Other'],
  jurisdictions:    ['United States', 'Canada', 'United Kingdom', 'European Union', 'Other'],
  portfolios:       ['CRE', 'C&I', 'Residential Mortgage', 'Auto', 'Equipment', 'Agriculture', 'Other'],
  creditQuality:    ['Strong', 'Moderate', 'Stressed', 'Unsure'],
  explored:         ['Yes', 'No', 'Unsure'],

  goals: [
    { id:'growth',        l:'Growth capacity',        s:'Free capital for new lending'   },
    { id:'concentration', l:'Concentration management', s:'Reduce single-sector exposure' },
    { id:'capital',       l:'Capital efficiency',     s:'Improve CET1 ratio'              },
    { id:'investor',      l:'Investor analysis',      s:'Assess SRT deal flow'            },
    { id:'media',         l:'Media research',         s:'Coverage and storylines'         },
    { id:'advisor',       l:'Advisor diligence',      s:'Mandate scoping'                 },
  ],

  loadSteps: [
    'Reviewing portfolio composition and jurisdiction',
    'Assessing capital efficiency relevance',
    'Mapping likely SRT use cases',
    'Preparing persona-specific next steps',
  ],

  steps:       ['Profile', 'Input mode', 'Portfolio', 'Analysis', 'Opportunity card'],
  lookupSteps: ['Profile', 'Input mode', 'Institution', 'Portfolio', 'Analysis', 'Opportunity card'],

  alternatives: [
    { name:'Subordinated debt',       capital:'Adds Tier 2',     speed:'Fast',               cost:'Ongoing coupon',         client:'No impact',       complexity:'Low',             vsSRT:'Raises regulatory capital but does not directly cut credit exposure or RWA concentration the way SRT does.' },
    { name:'Loan participations',     capital:'Cuts sold share', speed:'Moderate',            cost:'Pricing + ops',          client:'Mostly preserved', complexity:'Moderate',        vsSRT:'Shares risk and keeps some client benefit, but is often slower, less scalable, and less capital-efficient than SRT.' },
    { name:'Broadly syndicated loans',capital:'Lowers retained', speed:'Moderate',            cost:'Distribution economics', client:'Can dilute',       complexity:'Moderate',        vsSRT:'Distributes risk at origination but shifts the model toward originate-to-distribute, changing the bank\'s economics.' },
    { name:'Loan sales',              capital:'Direct RWA cut',  speed:'Fast once priced',    cost:'Possible loss on sale',  client:'Relationship lost', complexity:'Low to moderate', vsSRT:'Cleanest exposure reduction, but sacrifices the client, income, and control that SRT is designed to preserve.' },
    { name:'Slowing originations',    capital:'Conserves capital',speed:'Immediate',          cost:'Foregone revenue',       client:'Franchise erosion', complexity:'Low',             vsSRT:'Protects capital but gives up the growth, revenue, and competitive position SRT would let the bank keep.' },
  ] as AltOption[],

  exampleForm: { institution:'Bank', jurisdiction:'United States', assets:'38,500', capital:'11.2', portfolio:'CRE', portfolioSize:'4,200', goal:'capital', quality:'Moderate', explored:'No' } as SuitForm,

  goalLabel(id: string) { return OS.goals.find(g => g.id === id)?.l ?? id; },
  personaLabel(id: string) { return OS.personas.find(p => p.id === id)?.label ?? 'Bank or Credit Union'; },

  compute(_persona: string, f: SuitForm): Opportunity {
    let score = 45;
    if (f.institution === 'Bank') score += 12;
    else if (f.institution === 'Credit Union') score += 6;
    const jShape: Record<string,number> = { 'United States':12, 'European Union':12, 'United Kingdom':12, 'Canada':8, 'Other':3 };
    score += (jShape[f.jurisdiction] ?? 3);
    const assets = parseNum(f.assets);
    if (assets >= 50000) score += 12; else if (assets >= 10000) score += 9; else if (assets >= 2000) score += 6; else score += 2;
    const cap = parseNum(f.capital);
    if (cap > 0 && cap < 11) score += 10; else if (cap > 0 && cap < 13) score += 7; else if (cap > 0 && cap < 16) score += 4;
    const pShape: Record<string,number> = { 'CRE':12,'C&I':12,'Residential Mortgage':7,'Auto':6,'Equipment':6,'Agriculture':5,'Other':3 };
    score += (pShape[f.portfolio] ?? 3);
    const psize = parseNum(f.portfolioSize);
    if (psize >= 5000) score += 8; else if (psize >= 1000) score += 6; else if (psize >= 250) score += 3;
    const gShape: Record<string,number> = { growth:8, concentration:8, capital:9, investor:5, media:3, advisor:5 };
    score += (gShape[f.goal] ?? 3);
    if (f.quality === 'Strong') score += 4; else if (f.quality === 'Moderate') score += 3; else if (f.quality === 'Stressed') score -= 4;
    if (f.explored === 'Yes') score += 4;
    score = Math.max(15, Math.min(95, score));

    let label: string, color: string;
    if (score >= 80) { label = 'Strong Candidate'; color = B.gr; }
    else if (score >= 65) { label = 'Promising Candidate'; color = B.gr; }
    else if (score >= 50) { label = 'Worth Exploring'; color = B.am; }
    else { label = 'Limited Fit, more data needed'; color = B.s; }

    const reasons: string[] = [];
    if (f.goal === 'capital') reasons.push('capital-efficiency objective aligns directly with the typical SRT use case');
    if (f.goal === 'growth') reasons.push('growth-capacity objective is a classic motivation for SRT');
    if (f.goal === 'concentration') reasons.push('concentration-management goal is a recognised SRT use case');
    if (f.portfolio === 'CRE' || f.portfolio === 'C&I') reasons.push(`${f.portfolio} portfolios are among the most established reference pools in SRT`);
    if (cap > 0 && cap < 12) reasons.push('capital ratio suggests there is binding capital to be freed');
    if (assets >= 10000) reasons.push('institution size is consistent with scale needed for programmatic execution');
    if (f.jurisdiction === 'European Union') reasons.push('EU has a mature, regulator-recognised SRT framework');
    if (f.jurisdiction === 'United States') reasons.push('US framework has clarified treatment of synthetic securitisation');
    if (f.jurisdiction === 'United Kingdom') reasons.push('UK PRA has codified treatment under PS 5/26');

    const poolExplain: Record<string,string> = {
      'CRE': 'Commercial real estate portfolios are among the most common reference pools, with well-understood loss histories and clear data tape requirements.',
      'C&I': 'Corporate and industrial loan pools are the foundational SRT asset class, with deep investor appetite at the right vintage and diversification.',
      'Residential Mortgage': 'Residential mortgage SRT exists but is less established outside of GSE-influenced markets, investor appetite is narrower.',
      'Auto': 'Auto loan SRT is an emerging area; deal sizes can work but spread compression is real.',
      'Equipment': 'Equipment finance pools require careful structuring around lessee concentration but have a small, growing investor base.',
      'Agriculture': 'Agricultural credit is a less-traded asset class for synthetic risk transfer, possible but bespoke.',
      'Other': 'Less common reference asset classes can work in SRT but require additional investor and supervisor education.',
    };

    const directions: { h: string; s: string }[] = [];
    if (f.jurisdiction === 'United States' && assets < 50000) {
      directions.push({ h:'Funded credit-linked note', s:'A CLN structure is the most established US-recognised path for synthetic risk transfer in current practice.' });
      directions.push({ h:'Retained first-loss + mezzanine transfer', s:'Bank retains the first-loss piece (skin in the game) and places the mezzanine slice with investors.' });
    } else if (f.jurisdiction === 'European Union' || f.jurisdiction === 'United Kingdom') {
      directions.push({ h:'Unfunded guarantee (insurer-led)', s:'Where capacity exists, unfunded protection from a regulated insurer can be capital-efficient under the new PRA / EBA framework.' });
      directions.push({ h:'Funded credit-linked note', s:'Funded CLNs remain the workhorse structure, with deeper investor reach via SPV placement.' });
    } else {
      directions.push({ h:'Funded credit-linked note', s:'A CLN structure is generally the most portable starting point across jurisdictions.' });
      directions.push({ h:'Retained first-loss + mezzanine transfer', s:'Aligns originator interest while transferring the slice that drives capital relief.' });
    }

    const questions = [
      'Is the reference pool large and diversified enough to attract institutional investors?',
      'Is the historical loss performance of this portfolio stable and well-documented?',
      'What capital constraint is SRT intended to solve, and what is the alternative path?',
      'What data tape would investors need to price the protected tranche?',
      'What regulatory, accounting, tax, and legal issues require advisor review on this profile?',
      f.explored === 'No' ? 'Who internally would sponsor and execute a first SRT engagement?' : 'How would a follow-on programme compare with the prior transaction?',
    ];

    return { score, label, color, reasonsHigh: reasons.slice(0,3), poolExplain: poolExplain[f.portfolio] ?? '', directions, questions };
  },

  needRating(score: number) {
    if (score >= 78) return { label:'Strong', color: B.gr };
    if (score >= 62) return { label:'Moderate', color: B.am };
    return { label:'Weak', color: B.s };
  },

  confidence(f: SuitForm, isExample: boolean) {
    if (isExample) return { label:'Medium', color: B.am };
    const def = f.quality !== '' && f.quality !== 'Unsure';
    if (formFilled(f) === 9 && def) return { label:'High', color: B.gr };
    if (formFilled(f) >= 7) return { label:'Medium', color: B.am };
    return { label:'Low', color: B.s };
  },

  motives(f: SuitForm) {
    const cap = parseNum(f.capital);
    let primary: string, why: string;
    if (f.goal === 'capital') {
      primary = 'Regulatory capital relief';
      why = 'The stated capital-efficiency goal points to freeing regulatory capital on a constrained book.';
    } else if (f.goal === 'growth') {
      primary = 'Portfolio growth capacity';
      why = 'The growth goal suggests using SRT to create lending capacity without issuing common equity.';
    } else if (f.goal === 'concentration') {
      primary = 'Concentration management';
      why = 'The concentration goal points to reducing sector exposure while keeping the loans and clients.';
    } else if (cap > 0 && cap < 12) {
      primary = 'Regulatory capital relief';
      why = 'A binding capital ratio is the clearest inferred motive on these inputs.';
    } else if (f.portfolio === 'CRE') {
      primary = 'Concentration management';
      why = 'A CRE-weighted book points to concentration management as the likely motive.';
    } else {
      primary = 'RWA optimisation';
      why = 'With no binding capital signal, the likely motive is RWA optimisation rather than urgent relief.';
    }
    const candidates: string[] = [];
    if (cap > 0 && cap < 12) { candidates.push('RWA optimisation'); candidates.push('Avoiding common equity issuance'); }
    if (f.portfolio === 'CRE') candidates.push('Managing CRE concentration');
    if (f.goal === 'growth') candidates.push('Freeing capacity for higher-return origination');
    if (f.goal === 'concentration') candidates.push('Reducing retained exposure without selling loans');
    if (f.quality === 'Stressed') { candidates.push('Stress resilience'); candidates.push('Risk distribution'); }
    if (f.goal === 'capital') candidates.push('ROE improvement');
    const seen = new Set([primary]);
    const others: string[] = [];
    for (const c of candidates) { if (!seen.has(c)) { seen.add(c); others.push(c); } }
    return { primary, others: others.slice(0,3), why };
  },

  audienceQuestions(f: SuitForm) {
    const pf = f.portfolio || 'the portfolio';
    return [
      ['On the next earnings call', [
        `Is management exploring risk transfer or securitisation to manage RWA on ${pf === 'the portfolio' ? pf : 'the ' + pf + ' book'}?`,
        'What is the plan to fund growth without issuing common equity if capital tightens?',
      ]],
      ['Of investors / protection sellers', [
        'Who is selling protection on deals like this, and at what leverage?',
        `What loss performance and data tape would you need to price ${pf === 'the portfolio' ? pf : 'the ' + pf + ' book'}?`,
      ]],
      ['Of regulators / supervisors', [
        'What evidence supports significant risk transfer on a deal of this shape?',
        'How is investor leverage and interconnectedness being monitored?',
      ]],
      ['Of arrangers / counsel', [
        'Funded or unfunded, and why, for this profile?',
        'How are credit events, replenishment, and excess spread defined?',
      ]],
    ] as [string, string[]][];
  },
};

// ─── Institution sample data ───────────────────────────────────────────────────

const INSTITUTIONS: InstitutionResult[] = [
  { id:'us-pinnacle', name:'Pinnacle Bank', institutionType:'Bank', jurisdiction:'United States', ticker:'PNBK', lei:'5493001PNBK00X1AB47', assetsM:'9,800', capitalPct:'11.4', likelyPortfolio:'CRE', portfolioSizeM:'1,250', creditQuality:'Moderate', sourceLabel:'Public filings available', sourceDate:'Q1 2026', confidence:'high', prefillSummary:'Assets, jurisdiction, and capital ratio available from public filings. Portfolio mix is directional and needs review.' },
  { id:'us-summit', name:'Summit Credit Union', institutionType:'Credit Union', jurisdiction:'United States', ticker:'', lei:'5493001SUMM00Y2CD58', assetsM:'4,200', capitalPct:'12.1', likelyPortfolio:'C&I', portfolioSizeM:'600', creditQuality:'Strong', sourceLabel:'Partial public data', sourceDate:'2025', confidence:'medium', prefillSummary:'Assets and jurisdiction available. Capital and portfolio details are partial public data and need review.' },
  { id:'ca-cascade', name:'Cascade Bank', institutionType:'Bank', jurisdiction:'Canada', ticker:'CASB', lei:'5493001CASB00Z3EF69', assetsM:'22,500', capitalPct:'10.8', likelyPortfolio:'CRE', portfolioSizeM:'3,100', creditQuality:'Moderate', sourceLabel:'Public filings available', sourceDate:'Q4 2025', confidence:'high', prefillSummary:'Assets, jurisdiction, and capital ratio available. Portfolio details still required.' },
  { id:'us-frontier', name:'Frontier Federal Credit Union', institutionType:'Credit Union', jurisdiction:'United States', ticker:'', lei:'5493001FRNT00W4GH70', assetsM:'1,150', capitalPct:'', likelyPortfolio:'', portfolioSizeM:'', creditQuality:'', sourceLabel:'Manual review needed', sourceDate:'', confidence:'low', prefillSummary:'Limited public data. Approximate assets only. Most portfolio fields require manual entry.' },
  { id:'us-harbor', name:'Harbor Community Bank', institutionType:'Bank', jurisdiction:'United States', ticker:'HCBK', lei:'5493001HRBR00V5IJ81', assetsM:'6,400', capitalPct:'13.2', likelyPortfolio:'Residential Mortgage', portfolioSizeM:'2,000', creditQuality:'Strong', sourceLabel:'Partial public data', sourceDate:'2025', confidence:'medium', prefillSummary:'Jurisdiction and approximate assets available. Capital and portfolio details are partial and need review.' },
  { id:'ca-mapleridge', name:'Maple Ridge Credit Union', institutionType:'Credit Union', jurisdiction:'Canada', ticker:'', lei:'5493001MAPL00U6KL92', assetsM:'3,800', capitalPct:'11.9', likelyPortfolio:'Auto', portfolioSizeM:'900', creditQuality:'Moderate', sourceLabel:'Public filings available', sourceDate:'Q1 2026', confidence:'high', prefillSummary:'Assets, jurisdiction, and capital ratio available. Portfolio mix is directional and needs review.' },
];

function searchInstitutions(q: string): InstitutionResult[] {
  const lq = q.trim().toLowerCase();
  if (!lq) return INSTITUTIONS;
  return INSTITUTIONS.filter(r =>
    r.name.toLowerCase().includes(lq) || r.ticker.toLowerCase().includes(lq) ||
    r.lei.toLowerCase().includes(lq) || r.jurisdiction.toLowerCase().includes(lq) ||
    r.institutionType.toLowerCase().includes(lq)
  );
}

// ─── ScoreGauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const R = 68, CX = 88, CY = 88, CIRC = 2 * Math.PI * R;
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame: number, start: number | null = null;
    const dur = 1000;
    function tick(ts: number) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      setDisplayed(Math.round(score * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const filled = (displayed / 100) * CIRC;
  return (
    <div style={{ position:'relative', width:176, height:176, flexShrink:0 }}>
      <svg width={176} height={176} viewBox="0 0 176 176" style={{ transform:'rotate(-90deg)' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={B.bd} strokeWidth={14} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={14}
          strokeDasharray={`${filled} ${CIRC}`} strokeLinecap="round" />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
        <span style={{ fontSize:46, fontWeight:800, color:B.p, fontFamily:ff('geist'), lineHeight:1 }}>{displayed}</span>
        <span style={{ fontSize:12, fontWeight:600, color:B.s, fontFamily:ff('mono') }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── StepBar ──────────────────────────────────────────────────────────────────

function StepBar({ steps, current, canBack, onBack }: { steps: string[]; current: number; canBack: boolean; onBack: () => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:14, background:B.card, borderRadius:10, border:`1px solid ${B.bd}`, fontFamily:ff('geist') }}>
      {canBack && (
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 10px', borderRadius:6, border:`1px solid ${B.bd}`, background:'transparent', color:B.s, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }}>
          ‹ Back
        </button>
      )}
      <div style={{ display:'flex', alignItems:'center', gap:6, overflowX:'auto' }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, fontFamily:ff('mono'),
                background: i <= current ? B.bl : B.bg, border:`1px solid ${i <= current ? B.bl : B.bd}`, color: i <= current ? '#fff' : B.s }}>
                {i < current ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:12, fontWeight: i === current ? 700 : 600, color: i === current ? B.p : B.s, whiteSpace:'nowrap' }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width:18, height:1, background:B.bd, flexShrink:0 }} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function FieldLabel({ label, filled }: { label: string; filled: boolean }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
      <span style={{ fontSize:10, fontWeight:700, color:B.s, letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:ff('geist') }}>{label}</span>
      {filled && <span style={{ color:B.gr, fontSize:11 }}>✓</span>}
    </div>
  );
}

const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2359697A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`;

function FMenu({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <FieldLabel label={label} filled={value !== ''} />
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding:'10px 32px 10px 12px', borderRadius:8, border:`1px solid ${B.bd}`, fontSize:13, fontFamily:ff('geist'), color: value ? B.p : B.s, background:B.bg, fontWeight: value ? 600 : 400, appearance:'none', backgroundImage:selectArrow, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', cursor:'pointer', outline:'none' }}>
        <option value="">Select</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FMenuKeyed({ label, value, options, onChange }: { label: string; value: string; options: { id: string; l: string; s: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <FieldLabel label={label} filled={value !== ''} />
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding:'10px 32px 10px 12px', borderRadius:8, border:`1px solid ${B.bd}`, fontSize:13, fontFamily:ff('geist'), color: value ? B.p : B.s, background:B.bg, fontWeight: value ? 600 : 400, appearance:'none', backgroundImage:selectArrow, backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', cursor:'pointer', outline:'none' }}>
        <option value="">Select</option>
        {options.map(o => <option key={o.id} value={o.id}>{o.l}</option>)}
      </select>
    </div>
  );
}

function FText({ label, value, placeholder, onChange, prefix, suffix }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <FieldLabel label={label} filled={value !== ''} />
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 12px', borderRadius:8, border:`1px solid ${B.bd}`, background:B.bg }}>
        {prefix && <span style={{ fontSize:13, fontWeight:600, color:B.s, fontFamily:ff('mono') }}>{prefix}</span>}
        <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{ flex:1, border:'none', background:'transparent', fontSize:13, fontWeight:600, fontFamily:ff('mono'), color:B.p, outline:'none', minWidth:0 }} />
        {suffix && <span style={{ fontSize:12, fontWeight:600, color:B.s, fontFamily:ff('mono') }}>{suffix}</span>}
      </div>
    </div>
  );
}

function FTextArea({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      <FieldLabel label={label} filled={value !== ''} />
      <textarea value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} rows={3}
        style={{ padding:'10px 12px', borderRadius:8, border:`1px solid ${B.bd}`, background:B.bg, fontSize:13, fontFamily:ff('geist'), color:B.p, resize:'vertical', outline:'none' }} />
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Bdg({ label, color, dot }: { label: string; color: string; dot?: boolean }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', borderRadius:100, background:color+'1e', color, fontSize:10, fontWeight:700, fontFamily:ff('geist') }}>
      {dot && <span style={{ width:5, height:5, borderRadius:'50%', background:color, display:'inline-block' }} />}
      {label}
    </span>
  );
}

function PillStat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 9px', borderRadius:100, background:c+'1a', border:`1px solid ${c}4d`, fontSize:10, fontWeight:700, fontFamily:ff('geist') }}>
      <span style={{ color:B.s, textTransform:'uppercase', letterSpacing:'0.05em' }}>{k}</span>
      <span style={{ color:c }}>{v}</span>
    </span>
  );
}

function CardEyebrow({ tag, label }: { tag: string; label: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
      <span style={{ fontSize:11, fontWeight:800, color:'#fff', background:B.p, padding:'2px 6px', borderRadius:5, fontFamily:ff('mono') }}>{tag}</span>
      <span style={{ fontSize:10, fontWeight:700, color:B.s, letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:ff('geist') }}>{label}</span>
    </div>
  );
}

function SecCard({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, ...style }}>
      {title && (
        <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${B.bd}`, fontSize:15, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>{title}</div>
      )}
      <div style={{ padding:16 }}>{children}</div>
    </div>
  );
}

function OutBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding:10, borderRadius:8, background:B.bg, border:`1px solid ${B.bd}`, minHeight:46 }}>
      <div style={{ fontSize:8.5, fontWeight:700, color:B.s, textTransform:'uppercase', letterSpacing:'0.03em', fontFamily:ff('geist'), marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:15, fontWeight:700, color, fontFamily:ff('mono') }}>{value}</div>
    </div>
  );
}

function AltPill({ k, v }: { k: string; v: string }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 7px', borderRadius:5, background:B.card, border:`1px solid ${B.bd}` }}>
      <span style={{ fontSize:8, fontWeight:700, color:B.s, textTransform:'uppercase', fontFamily:ff('geist') }}>{k}</span>
      <span style={{ fontSize:10, fontWeight:600, color:B.p, fontFamily:ff('geist') }}>{v}</span>
    </span>
  );
}

function Bullet({ text, color = B.bl }: { text: string; color?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
      <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0, marginTop:6 }} />
      <span style={{ fontSize:12, color:B.p, fontFamily:ff('geist'), lineHeight:1.6 }}>{text}</span>
    </div>
  );
}

// ─── HeroTrancheStack ─────────────────────────────────────────────────────────

function HeroTrancheStack() {
  const bands = [
    { lab:'Senior retained', pct:'92.0%', color:B.s, h:70 },
    { lab:'Protected mezz',  pct:'7.5%',  color:B.bl, h:40 },
    { lab:'First-loss',      pct:'0.5%',  color:B.am, h:26 },
  ];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
        <span style={{ fontSize:10, fontWeight:700, color:B.s, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:ff('geist') }}>CAPITAL STACK · BY TRANCHE</span>
        <span style={{ fontSize:10, fontWeight:700, color:B.s, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:ff('geist') }}>% OF POOL</span>
      </div>
      {bands.map(b => (
        <div key={b.lab} style={{ height:b.h, borderRadius:5, background:b.color+'26', border:`1px solid ${b.color}80`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px' }}>
          <span style={{ fontSize:12, fontWeight:700, color:b.color, fontFamily:ff('geist') }}>{b.lab}</span>
          <span style={{ fontSize:12, fontWeight:700, color:B.p, fontFamily:ff('mono') }}>{b.pct}</span>
        </div>
      ))}
    </div>
  );
}

// ─── HeroFlow ─────────────────────────────────────────────────────────────────

function HeroFlow() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <span style={{ fontSize:9.5, fontWeight:700, color:B.gr, fontFamily:ff('mono') }}>PREMIUM · 8.5% p.a.</span>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {['Bank', 'Investor'].map((n, i) => (
          <React.Fragment key={n}>
            <div style={{ flex:1, padding:'12px 0', borderRadius:9, background:B.bg, border:`1px solid ${B.bd}`, textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>{n}</div>
              <div style={{ fontSize:9.5, color:B.s, fontFamily:ff('mono') }}>{n === 'Bank' ? 'protection buyer' : 'protection seller'}</div>
            </div>
            {i === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <span style={{ color:B.gr, fontSize:12 }}>→</span>
                <span style={{ color:B.rd, fontSize:12 }}>←</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ textAlign:'right' }}>
        <span style={{ fontSize:9.5, fontWeight:700, color:B.rd, fontFamily:ff('mono') }}>LOSS PROTECTION · IF NEEDED</span>
      </div>
    </div>
  );
}

function HeroStat({ v, unit, label, color }: { v: string; unit: string; label: string; color: string }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
      <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
        <span style={{ fontSize:22, fontWeight:800, color, fontFamily:ff('geist') }}>{v}</span>
        {unit && <span style={{ fontSize:11, fontWeight:600, color:B.s, fontFamily:ff('mono') }}>{unit}</span>}
      </div>
      <span style={{ fontSize:9, fontWeight:700, color:B.s, letterSpacing:'0.05em', textTransform:'uppercase', fontFamily:ff('geist') }}>{label}</span>
    </div>
  );
}

function LandMeta({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ flex:1, padding:14, background:B.card, borderRadius:10, border:`1px solid ${B.bd}` }}>
      <div style={{ fontSize:18, fontWeight:800, color:B.p, fontFamily:ff('mono') }}>{n}</div>
      <div style={{ fontSize:11, color:B.s, fontFamily:ff('geist'), marginTop:3 }}>{l}</div>
    </div>
  );
}

// ─── SuitLanding ──────────────────────────────────────────────────────────────

function SuitLanding({ wide, onStart, onExample }: { wide: boolean; onStart: () => void; onExample: () => void }) {
  const heroBg = `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`;
  return (
    <div style={{ background:heroBg, minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:ff('geist') }}>
      <div style={{ height:80 }} />
      <div style={{ flex:1, padding:`0 ${wide ? 40 : 20}px`, display:'flex', alignItems:'stretch' }}>
        <div style={{ maxWidth:1180, width:'100%', margin:'0 auto', display:'flex', flexDirection: wide ? 'row' : 'column', gap:24, alignItems: wide ? 'flex-start' : undefined, paddingTop: wide ? 32 : 20 }}>

          {/* Left: hero copy */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'flex-start' }}>
            {/* Eyebrow */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'6px 12px', borderRadius:100, background:'rgba(255,255,255,0.6)', border:`1px solid ${C.line}`, marginBottom: wide ? 26 : 20 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:C.green, boxShadow:`0 0 0 4px ${C.green}30` }} />
              <span style={{ fontSize:12, color:C.mute, fontFamily:ff('mono') }}>SRT Opportunity Scanner · free tool · v1.0</span>
            </div>

            {/* Two-tone headline */}
            <div style={{ fontSize: wide ? 46 : 32, fontWeight:500, lineHeight:1.12, letterSpacing: wide ? -1.4 : -0.8, marginBottom:22 }}>
              <span style={{ color:C.ink }}>See whether SRT may be relevant </span>
              <span style={{ color:C.mute, fontWeight:400 }}>to your institution, portfolio, or coverage area.</span>
            </div>

            {/* Mono comment lines */}
            <div style={{ display:'flex', flexDirection:'column', gap:3, marginBottom:30 }}>
              <span style={{ fontSize: wide ? 13 : 11.5, color:C.ink2, fontFamily:ff('mono'), lineHeight:1.7 }}>// Directional read for banks, credit unions, investors, advisors, and reporters.</span>
              <span style={{ fontSize: wide ? 13 : 11.5, color:C.ink2, fontFamily:ff('mono'), lineHeight:1.7 }}>// See where SRT may matter, what to ask next, and what data a real assessment needs.</span>
            </div>

            <div style={{ flex:1 }} />

            {/* CTAs */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              <button onClick={onStart} style={{ padding:'13px 20px', borderRadius:10, border:'none', background:C.ink, color:'#fff', fontSize:15, fontWeight:500, fontFamily:ff('geist'), cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                Start scan <span style={{ opacity:0.9 }}>↗︎</span>
              </button>
              <button onClick={onExample} style={{ padding:'13px 18px', borderRadius:10, border:`1px solid ${C.line}`, background:'transparent', color:C.ink2, fontSize:15, fontWeight:500, fontFamily:ff('geist'), cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                See example report <span style={{ opacity:0.7 }}>↗︎</span>
              </button>
            </div>
          </div>

          {/* Right: live structure preview */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10 }}>
              <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${B.bd}` }}>
                <span style={{ fontSize:15, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>Live structure preview</span>
              </div>
              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:B.p, fontFamily:ff('geist') }}>CRE-anchored synthetic risk transfer</div>
                    <div style={{ fontSize:12, color:B.s, fontFamily:ff('geist') }}>Funded CLN · retained first-loss · illustrative</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:B.p, fontFamily:ff('mono'), padding:'5px 8px', background:B.bg, borderRadius:100, whiteSpace:'nowrap', flexShrink:0 }}>$4.2B reference pool</span>
                </div>
                <HeroTrancheStack />
                <div style={{ height:1, background:B.bd }} />
                <HeroFlow />
                <div style={{ height:1, background:B.bd }} />
                <div style={{ display:'flex', gap:0 }}>
                  <HeroStat v="+125" unit="bps" label="CET1 RELIEF" color={B.gr} />
                  <HeroStat v="−$1.8B" unit="" label="RWA REDUCTION" color={B.bl} />
                  <HeroStat v="76" unit="/100" label="FIT SCORE" color={B.p} />
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <LandMeta n="4" l="audience profiles" />
              <LandMeta n="~ 3 min" l="to first read" />
              <LandMeta n="0 PII" l="no account required" />
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:`${wide ? 24 : 18}px ${wide ? 40 : 20}px 32px` }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <span style={{ fontSize:11, color:C.mute, fontFamily:ff('mono') }}>Directional and educational only. Not legal, regulatory, accounting, tax, investment, or capital treatment advice.</span>
        </div>
      </div>
    </div>
  );
}

// ─── SuitPersona ──────────────────────────────────────────────────────────────

function SuitPersona({ wide, persona, onNext }: { wide: boolean; persona: string; onNext: (p: string) => void }) {
  const [sel, setSel] = useState(persona);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, fontFamily:ff('geist') }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:8 }}>STEP 01 · CHOOSE YOUR PROFILE</div>
        <h2 style={{ margin:'0 0 8px', fontSize:24, fontWeight:800, color:B.p }}>Who are you scanning for?</h2>
        <p style={{ margin:0, fontSize:13, color:B.s }}>We tailor the language, the recommended structure direction, and the next step you will see at the end.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap:12 }}>
        {OS.personas.map(p => (
          <button key={p.id} onClick={() => setSel(p.id)}
            style={{ display:'flex', alignItems:'flex-start', gap:12, padding:14, borderRadius:10, border:`${sel === p.id ? 1.5 : 1}px solid ${sel === p.id ? B.bl : B.bd}`, background:B.card, textAlign:'left', cursor:'pointer', fontFamily:ff('geist') }}>
            <div style={{ width:40, height:40, borderRadius:9, background:(sel===p.id ? B.bl : B.s)+'1e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
              {p.id === 'investor' ? '📈' : p.id === 'bank' ? '🏛' : p.id === 'advisor' ? '💼' : '📰'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:700, color:B.p }}>{p.label}</div>
              <div style={{ fontSize:11.5, color:B.s, marginTop:4, lineHeight:1.5 }}>{p.sub}</div>
            </div>
            <span style={{ fontSize:16, color: sel === p.id ? B.bl : B.bd, marginTop:2 }}>{sel === p.id ? '●' : '○'}</span>
          </button>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:600, color: sel ? B.p : B.s }}>
          {sel ? `Selected · ${OS.personaLabel(sel)}` : 'Pick one to continue'}
        </span>
        <button onClick={() => sel && onNext(sel)} disabled={!sel}
          style={{ padding:'10px 16px', borderRadius:6, border:'none', background: sel ? B.bl : B.bd, color:'#fff', fontSize:12, fontWeight:600, cursor: sel ? 'pointer' : 'default', fontFamily:ff('geist') }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── SuitMode ─────────────────────────────────────────────────────────────────

function SuitMode({ wide, onPick }: { wide: boolean; onPick: (m: string) => void }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, fontFamily:ff('geist') }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:8 }}>STEP 02 · INPUT MODE</div>
        <h2 style={{ margin:'0 0 8px', fontSize:24, fontWeight:800, color:B.p }}>How do you want to provide details?</h2>
        <p style={{ margin:0, fontSize:13, color:B.s }}>All three lead to the same Opportunity Card. The quick form is the fastest path to a directional read.</p>
      </div>
      <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr 1fr 1fr' : '1fr', gap:12 }}>
        {OS.modes.map(m => (
          <button key={m.id} onClick={() => onPick(m.id)}
            style={{ display:'flex', flexDirection:'column', gap:10, padding:16, borderRadius:10, border:`1px solid ${B.bd}`, background:B.card, textAlign:'left', cursor:'pointer', minHeight:170, fontFamily:ff('geist') }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:18, color:B.bl }}>
                {m.id === 'lookup' ? '🔍' : m.id === 'quick' ? '📋' : '📄'}
              </span>
              {m.recommended && <Bdg label="Recommended" color={B.gr} dot />}
            </div>
            <div style={{ fontSize:15, fontWeight:700, color:B.p }}>{m.label}</div>
            <div style={{ fontSize:12, color:B.s, flex:1, lineHeight:1.5 }}>{m.body}</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:B.bl }}>
              {m.cta} <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SuitInstitutionSearch ────────────────────────────────────────────────────

const LOAD_MSGS = ['Searching institution identifiers', 'Checking public balance-sheet fields', 'Preparing editable profile'];

function SuitInstitutionSearch({ wide, onUse, onManual }: { wide: boolean; onUse: (r: InstitutionResult) => void; onManual: () => void }) {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<'idle'|'loading'|'results'|'empty'>('idle');
  const [results, setResults] = useState<InstitutionResult[]>([]);
  const [loadIdx, setLoadIdx] = useState(0);
  const [selected, setSelected] = useState<InstitutionResult|null>(null);
  const [suggestions, setSuggestions] = useState<InstitutionResult[]>([]);
  const [focused, setFocused] = useState(false);

  const confColor = (c: LookupConf) => c === 'high' ? B.gr : c === 'medium' ? B.am : B.s;
  const confLabel = (c: LookupConf) => c === 'high' ? 'High confidence' : c === 'medium' ? 'Medium confidence' : 'Low confidence';

  function runSearch() {
    setSelected(null); setLoadIdx(0); setPhase('loading');
    let idx = 0;
    function tick() {
      if (idx < LOAD_MSGS.length) { setTimeout(() => { idx++; setLoadIdx(idx); tick(); }, 450); }
      else { const r = searchInstitutions(query); setResults(r); setPhase(r.length ? 'results' : 'empty'); }
    }
    tick();
  }

  function prefillPairs(r: InstitutionResult): [string,string][] {
    const out: [string,string][] = [];
    if (r.institutionType) out.push(['Institution type', r.institutionType]);
    if (r.jurisdiction)    out.push(['Jurisdiction',     r.jurisdiction]);
    if (r.assetsM)         out.push(['Total assets',     `$${r.assetsM}M`]);
    if (r.capitalPct)      out.push(['Capital ratio',    `${r.capitalPct}%`]);
    if (r.likelyPortfolio) out.push(['Portfolio type',   r.likelyPortfolio]);
    if (r.portfolioSizeM)  out.push(['Portfolio size',   `$${r.portfolioSizeM}M`]);
    if (r.creditQuality)   out.push(['Credit quality',   r.creditQuality]);
    return out;
  }

  function missingFields(r: InstitutionResult): string[] {
    const probed: [string,boolean][] = [
      ['Institution type', !!r.institutionType], ['Jurisdiction', !!r.jurisdiction],
      ['Total assets', !!r.assetsM], ['Capital ratio', !!r.capitalPct],
      ['Portfolio type', !!r.likelyPortfolio], ['Portfolio size', !!r.portfolioSizeM],
      ['Credit quality', !!r.creditQuality],
    ];
    const miss = probed.filter(p => !p[1]).map(p => p[0]);
    miss.push('Primary goal', 'Explored SRT before');
    return miss;
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, fontFamily:ff('geist') }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:8 }}>STEP 03 · INSTITUTION LOOKUP</div>
        <h2 style={{ margin:'0 0 8px', fontSize:24, fontWeight:800, color:B.p }}>Search for a bank or credit union.</h2>
        <p style={{ margin:0, fontSize:13, color:B.s }}>Look up an institution by name, ticker, or LEI. We will prefill the portfolio profile where public information is available, and you can review or edit before generating the Opportunity Card.</p>
      </div>

      {selected ? (
        <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:B.p }}>{selected.name}</div>
              <div style={{ fontSize:12, color:B.s, marginTop:3 }}>{selected.institutionType} · {selected.jurisdiction}{selected.ticker ? ` · ${selected.ticker}` : ''}</div>
            </div>
            <Bdg label={confLabel(selected.confidence)} color={confColor(selected.confidence)} dot />
          </div>
          <div style={{ fontSize:12, color:B.s, padding:'10px 12px', borderRadius:8, background:B.bg }}>{selected.prefillSummary}</div>
          <div style={{ display:'flex', flexDirection: wide ? 'row' : 'column', gap:12 }}>
            <div style={{ flex:1, padding:12, borderRadius:9, background:B.gr+'0f', border:`1px solid ${B.gr}40` }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ color:B.gr, fontSize:11 }}>✓</span>
                <span style={{ fontSize:9, fontWeight:700, color:B.s, textTransform:'uppercase', letterSpacing:'0.05em' }}>WILL BE PREFILLED</span>
              </div>
              {prefillPairs(selected).length === 0
                ? <span style={{ fontSize:11.5, color:B.s }}>No public fields to prefill. Everything will be entered manually.</span>
                : prefillPairs(selected).map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:600, color:B.p }}>{k}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:B.p, fontFamily:ff('mono') }}>{v}</span>
                  </div>
                ))
              }
            </div>
            <div style={{ flex:1, padding:12, borderRadius:9, background:B.am+'0f', border:`1px solid ${B.am}40` }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ color:B.am, fontSize:11 }}>✏</span>
                <span style={{ fontSize:9, fontWeight:700, color:B.s, textTransform:'uppercase', letterSpacing:'0.05em' }}>STILL NEEDS YOUR INPUT</span>
              </div>
              {missingFields(selected).map(f => (
                <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:B.am, flexShrink:0 }} />
                  <span style={{ fontSize:11, fontWeight:600, color:B.p }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            <button onClick={() => onUse(selected)} style={{ padding:'10px 16px', borderRadius:6, border:'none', background:B.bl, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>Continue to portfolio profile →</button>
            <button onClick={() => setSelected(null)} style={{ padding:'10px 16px', borderRadius:6, border:`1px solid ${B.bd}`, background:'transparent', color:B.s, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>Choose another institution</button>
          </div>
          <span style={{ fontSize:10.5, color:B.s }}>Prefilled values are public information and directional. Nothing here is verified capital treatment or a complete financial statement.</span>
        </div>
      ) : (
        <>
          {/* Search card */}
          <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 12px', borderRadius:8, border:`1px solid ${B.bd}`, background:B.bg }}>
                <span style={{ color:B.s, fontSize:13 }}>🔍</span>
                <input value={query} onChange={e => { setQuery(e.target.value); setSuggestions(searchInstitutions(e.target.value).slice(0,6)); }}
                  onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
                  onKeyDown={e => e.key === 'Enter' && runSearch()}
                  placeholder="Search by institution name, ticker, or LEI"
                  style={{ flex:1, border:'none', background:'transparent', fontSize:13, color:B.p, fontFamily:ff('geist'), outline:'none' }} />
                {query && <button onClick={() => setQuery('')} style={{ border:'none', background:'none', cursor:'pointer', color:B.s, fontSize:13 }}>✕</button>}
              </div>
              {focused && query && suggestions.length > 0 && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, background:B.card, border:`1px solid ${B.bd}`, borderRadius:8, zIndex:10, overflow:'hidden', marginTop:4 }}>
                  {suggestions.map((s, i) => (
                    <button key={s.id} onMouseDown={() => { setQuery(s.name); setSuggestions([]); setFocused(false); setTimeout(runSearch, 0); }}
                      style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'9px 12px', border:'none', borderBottom: i < suggestions.length-1 ? `1px solid ${B.bd}` : 'none', background:'transparent', textAlign:'left', cursor:'pointer', fontFamily:ff('geist') }}>
                      <span style={{ color:B.s, fontSize:12 }}>🏛</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:B.p }}>{s.name}</div>
                        <div style={{ fontSize:11, color:B.s }}>{s.institutionType} · {s.jurisdiction}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              <button onClick={runSearch} style={{ padding:'10px 14px', borderRadius:6, border:'none', background:B.bl, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>Search</button>
              <button onClick={onManual} style={{ padding:'10px 14px', borderRadius:6, border:`1px solid ${B.bd}`, background:'transparent', color:B.s, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>Enter details manually</button>
            </div>
            <div style={{ display:'flex', alignItems:'flex-start', gap:7, fontSize:11, color:B.s }}>
              <span style={{ flexShrink:0, marginTop:1 }}>🔒</span>
              <span>Use public, non-sensitive identifiers only. Do not enter borrower names, account numbers, or confidential portfolio data.</span>
            </div>
          </div>

          {/* Phase: loading */}
          {phase === 'loading' && (
            <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
              <div style={{ fontSize:15, fontWeight:700, color:B.p, marginBottom:14 }}>Searching</div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {LOAD_MSGS.map((msg, i) => (
                  <div key={msg} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:18, height:18, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {i < loadIdx ? <span style={{ color:B.gr }}>✓</span> : i === loadIdx ? <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>◌</span> : <div style={{ width:16, height:16, borderRadius:'50%', border:`1.5px solid ${B.bd}` }} />}
                    </div>
                    <span style={{ fontSize:13, fontWeight: i <= loadIdx ? 600 : 400, color: i <= loadIdx ? B.p : B.s, fontFamily:ff('geist') }}>{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase: results */}
          {phase === 'results' && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:15, fontWeight:700, color:B.p }}>{results.length} possible match{results.length !== 1 ? 'es' : ''}</div>
              {results.map(r => (
                <button key={r.id} onClick={() => setSelected(r)}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:10, border:`1px solid ${B.bd}`, background:B.card, textAlign:'left', cursor:'pointer', fontFamily:ff('geist') }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:B.bg, border:`1px solid ${B.bd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                    {r.institutionType === 'Credit Union' ? '🤝' : '🏛'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:B.p }}>{r.name}</div>
                    <div style={{ fontSize:12, color:B.s, marginTop:3 }}>{r.institutionType} · {r.jurisdiction}{r.ticker ? ` · ${r.ticker}` : ''}</div>
                  </div>
                  <Bdg label={confLabel(r.confidence)} color={confColor(r.confidence)} dot />
                </button>
              ))}
            </div>
          )}

          {/* Phase: empty */}
          {phase === 'empty' && (
            <div style={{ padding:24, textAlign:'center', color:B.s, fontSize:14, background:B.card, borderRadius:10, border:`1px solid ${B.bd}` }}>
              No institutions found for "{query}". <button onClick={onManual} style={{ border:'none', background:'none', color:B.bl, cursor:'pointer', fontSize:14, fontWeight:600 }}>Enter details manually</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SuitFormScreen ───────────────────────────────────────────────────────────

function SuitFormScreen({ wide, form, onChange, stepNo, onSubmit }: { wide: boolean; form: SuitForm; onChange: (f: SuitForm) => void; stepNo: number; onSubmit: () => void }) {
  const set = (k: keyof SuitForm) => (v: string) => onChange({ ...form, [k]: v });
  const filled = formFilled(form);
  const complete = filled === 9;
  const pctFill = (filled / 9) * 100;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, fontFamily:ff('geist') }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.09em', textTransform:'uppercase', marginBottom:8 }}>
          STEP {String(stepNo).padStart(2,'0')} · PORTFOLIO PROFILE
        </div>
        <h2 style={{ margin:'0 0 8px', fontSize:24, fontWeight:800, color:B.p }}>Tell us about the institution and portfolio.</h2>
        <p style={{ margin:0, fontSize:13, color:B.s }}>Nine short inputs. No names, account numbers, or personal data are required. Approximate figures are fine for a directional read.</p>
      </div>

      {/* Institution sec */}
      <SecCard title="Institution">
        <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap:14 }}>
          <FMenu label="Institution type" value={form.institution} options={OS.institutionTypes} onChange={set('institution')} />
          <FMenu label="Jurisdiction" value={form.jurisdiction} options={OS.jurisdictions} onChange={set('jurisdiction')} />
          <FText label="Total assets" value={form.assets} placeholder="e.g. 38,500" onChange={set('assets')} prefix="$" suffix="M" />
          <FText label="CET1 / capital ratio" value={form.capital} placeholder="e.g. 11.2" onChange={set('capital')} suffix="%" />
        </div>
      </SecCard>

      {/* Portfolio sec */}
      <SecCard title="Reference portfolio">
        <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr 1fr' : '1fr', gap:14 }}>
          <FMenu label="Portfolio type" value={form.portfolio} options={OS.portfolios} onChange={set('portfolio')} />
          <FText label="Portfolio size" value={form.portfolioSize} placeholder="e.g. 4,200" onChange={set('portfolioSize')} prefix="$" suffix="M" />
          <FMenuKeyed label="Primary goal" value={form.goal} options={OS.goals} onChange={set('goal')} />
          <FMenu label="Credit quality" value={form.quality} options={OS.creditQuality} onChange={set('quality')} />
          <FMenu label="Explored SRT before?" value={form.explored} options={OS.explored} onChange={set('explored')} />
        </div>
      </SecCard>

      {/* Progress + submit */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color: complete ? B.gr : B.s, fontFamily:ff('mono'), marginBottom:6 }}>{filled} / 9 fields complete</div>
          <div style={{ width:180, height:4, borderRadius:2, background:B.bd, overflow:'hidden' }}>
            <div style={{ width:`${pctFill}%`, height:'100%', background: complete ? B.gr : B.bl, borderRadius:2, transition:'width 0.3s' }} />
          </div>
        </div>
        <button onClick={() => complete && onSubmit()} disabled={!complete}
          style={{ padding:'10px 16px', borderRadius:6, border:'none', background: complete ? B.bl : B.bd, color:'#fff', fontSize:12, fontWeight:600, cursor: complete ? 'pointer' : 'default', opacity: complete ? 1 : 0.5, fontFamily:ff('geist') }}>
          ✨ Generate Opportunity Card
        </button>
      </div>
    </div>
  );
}

// ─── SuitLoading ──────────────────────────────────────────────────────────────

function SuitLoading({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    function tick(i: number) {
      if (i < OS.loadSteps.length) {
        setTimeout(() => { setIdx(i + 1); tick(i + 1); }, 600);
      } else {
        setTimeout(() => doneRef.current(), 450);
      }
    }
    tick(0);
  }, []);

  return (
    <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
      <div style={{ fontSize:15, fontWeight:700, color:B.p, fontFamily:ff('geist'), marginBottom:14 }}>Analysing</div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {OS.loadSteps.map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:18, height:18, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {i < idx
                ? <span style={{ color:B.gr, fontSize:15 }}>✓</span>
                : i === idx
                  ? <span style={{ fontSize:13, color:B.bl }}>◌</span>
                  : <div style={{ width:16, height:16, borderRadius:'50%', border:`1.5px solid ${B.bd}` }} />
              }
            </div>
            <span style={{ fontSize:13, fontWeight: i <= idx ? 600 : 400, color: i <= idx ? B.p : B.s, fontFamily:ff('geist') }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SuitResults ──────────────────────────────────────────────────────────────

function SuitResults({ wide, persona, form, isExample }: { wide: boolean; persona: string; form: SuitForm; isExample: boolean }) {
  const [aTranche,    setATranche]    = useState(8);
  const [aRiskWeight, setARiskWeight] = useState(100);
  const [aSpread,     setASpread]     = useState(9);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const opp  = OS.compute(persona, form);
  const need = OS.needRating(opp.score);
  const conf = OS.confidence(form, isExample);
  const mot  = OS.motives(form);

  const P          = parseNum(form.portfolioSize);
  const capIn      = parseNum(form.capital);
  const capRatio   = capIn > 0 ? capIn : 12;
  const preRWA     = P * aRiskWeight / 100;
  const trancheN   = P * aTranche / 100;
  const redPct     = Math.min(0.9, (aTranche / 100) * 10);
  const rwaRed     = preRWA * redPct;
  const postRWA    = preRWA - rwaRed;
  const capFreed   = rwaRed * capRatio / 100;
  const annCost    = trancheN * aSpread / 100;
  const netBenefit = capFreed * 0.12 - annCost;
  const has        = P > 0;

  const limited = conf.label === 'Low' || formFilled(form) < 9 || isExample;
  const today   = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });

  function Slider({ label, value, setValue, min, max, step }: { label: string; value: number; setValue: (v:number)=>void; min:number; max:number; step:number }) {
    const txt = Number.isInteger(value) ? value + '%' : value.toFixed(1) + '%';
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, fontWeight:600, color:B.p, fontFamily:ff('geist') }}>{label}</span>
          <span style={{ fontSize:12, fontWeight:700, color:B.bl, fontFamily:ff('mono') }}>{txt}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => setValue(parseFloat(e.target.value))}
          style={{ width:'100%', accentColor:B.bl }} />
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, fontFamily:ff('geist') }}>

      {/* Head */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {isExample
          ? <Bdg label="Illustrative example · dummy data" color={B.am} dot />
          : <div style={{ fontSize:11, fontWeight:700, color:B.s, letterSpacing:'0.09em', textTransform:'uppercase' }}>STEP 05 · OPPORTUNITY CARD</div>
        }
        <h2 style={{ margin:0, fontSize:26, fontWeight:800, color:B.p }}>SRT Opportunity Card</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
          {[['Profile', OS.personaLabel(persona)], ['Portfolio', form.portfolio || '-'], ['Jurisdiction', form.jurisdiction || '-'], ['Generated', today]].map(([k,v]) => (
            <span key={k} style={{ fontSize:11, color:B.s }}>
              {k} · <strong style={{ color:B.p }}>{v}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* Data note */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:14 }}>
        <div style={{ display:'flex', gap:8, marginBottom:8 }}>
          <Bdg label="Disclosed inputs" color={B.gr} dot />
          <Bdg label="Inferred analysis" color={B.pu} dot />
        </div>
        <p style={{ margin:'0 0 10px', fontSize:11.5, color:B.s, lineHeight:1.6 }}>The institution and portfolio figures you entered are treated as stated facts. The Fit Score, need rating, motive, benefit estimate, and alternatives are inferred analysis, not figures disclosed by the institution. When sourcing from public filings, record the document and publication date for each input.</p>
        {limited && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:10, borderRadius:8, background:B.am+'14', border:`1px solid ${B.am}4d` }}>
            <span style={{ color:B.am, flexShrink:0, marginTop:1 }}>⚠</span>
            <span style={{ fontSize:11.5, color:B.p, lineHeight:1.5 }}>Public data here is limited, illustrative, or incomplete, so this read is directional only and not a basis for a strong conclusion. Capital, RWA, and concentration disclosures would sharpen it.</span>
          </div>
        )}
      </div>

      {/* A – Score */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="A" label="SRT Fit Score & need rating" />
        <div style={{ display:'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : undefined, gap: wide ? 22 : 16, marginTop:12 }}>
          <ScoreGauge score={opp.score} color={opp.color} />
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ fontSize:26, fontWeight:800, color:opp.color }}>{opp.label}</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              <PillStat k="SRT need" v={need.label} c={need.color} />
              <PillStat k="Confidence" v={conf.label} c={conf.color} />
              <PillStat k="Primary motive" v={mot.primary} c={B.bl} />
            </div>
            <p style={{ margin:0, fontSize:13, color:B.s, lineHeight:1.6 }}>A directional read on whether the inputs you described align with the profiles where SRT is most commonly relevant. This is not a transaction-level assessment.</p>
          </div>
        </div>
      </div>

      {/* B + C side by side on wide */}
      <div style={{ display: wide ? 'grid' : 'flex', gridTemplateColumns: wide ? '1fr 1fr' : undefined, flexDirection:'column', gap:14 }}>
        {/* B – Rationale */}
        <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
          <CardEyebrow tag="B" label="Primary SRT rationale" />
          <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0' }}>This profile suggests SRT may be relevant.</div>
          {opp.reasonsHigh.length === 0
            ? <p style={{ margin:0, fontSize:12.5, color:B.s, lineHeight:1.6 }}>On these inputs, the directional case for SRT is moderate. The Fit Score above reflects this — more portfolio detail would sharpen the read.</p>
            : <>
              <p style={{ margin:'0 0 10px', fontSize:12.5, color:B.s }}>Capital intensity, concentration management, or growth capacity look like strategic concerns here. Specifically:</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {opp.reasonsHigh.map(r => <Bullet key={r} text={r} />)}
              </div>
            </>
          }
        </div>

        {/* C – Motive */}
        <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
          <CardEyebrow tag="C" label="Likely SRT motive" />
          <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0' }}>{mot.primary}</div>
          <p style={{ margin:'0 0 10px', fontSize:12.5, color:B.s, lineHeight:1.6 }}>{mot.why}</p>
          {mot.others.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ fontSize:9, fontWeight:700, color:B.s, textTransform:'uppercase', letterSpacing:'0.05em' }}>OTHER POSSIBLE MOTIVES</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {mot.others.map(o => (
                  <span key={o} style={{ fontSize:10, fontWeight:600, color:B.bl, padding:'4px 8px', borderRadius:100, background:B.bl+'1a' }}>{o}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ margin:'10px 0 0', fontSize:11, color:B.s }}>More than one motive can apply. The primary is inferred from the stated goal, capital position, and portfolio, not disclosed by the institution.</p>
        </div>
      </div>

      {/* D – Pool */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="D" label="Best-fit reference pool" />
        <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0' }}>{form.portfolio || 'Reference pool'}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:700, color:B.bl, padding:'3px 8px', borderRadius:100, background:B.bl+'1e' }}>{form.portfolio || '-'}</span>
          <span style={{ fontSize:11, fontWeight:600, color:B.p, fontFamily:ff('mono') }}>~ ${form.portfolioSize || '-'}M</span>
          <div style={{ flex:1 }} />
          <Bdg label={opp.score >= 65 ? 'High suitability' : opp.score >= 50 ? 'Moderate' : 'Limited'} color={opp.score >= 65 ? B.gr : opp.score >= 50 ? B.am : B.s} dot />
        </div>
        <p style={{ margin:'0 0 8px', fontSize:12.5, color:B.s, lineHeight:1.6 }}>{opp.poolExplain}</p>
        <p style={{ margin:0, fontSize:11, color:B.s }}>Asset-class suitability reflects pool size, growth, capital intensity, credit performance, disclosure quality, and investor appetite for the asset class.</p>
      </div>

      {/* E – Benefit estimator */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="E" label="Estimated strategic benefit" />
        <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0' }}>A stylised capital-relief estimate. Move the sliders to test sensitivity.</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
          <Slider label="Transferred tranche thickness" value={aTranche}    setValue={setATranche}    min={2}  max={15}  step={0.5} />
          <Slider label="Assumed average risk weight"   value={aRiskWeight} setValue={setARiskWeight} min={20} max={150} step={5} />
          <Slider label="Protection spread (per year)"  value={aSpread}     setValue={setASpread}     min={3}  max={18}  step={0.5} />
        </div>
        <div style={{ height:1, background:B.bd, marginBottom:12 }} />
        <div style={{ display:'grid', gridTemplateColumns: wide ? '1fr 1fr 1fr' : '1fr 1fr', gap:12 }}>
          <OutBox label="Candidate portfolio"    value={has ? fmtM(P)           : 'n/a'} color={B.p} />
          <OutBox label="Pre-SRT RWA"            value={has ? fmtM(preRWA)      : 'n/a'} color={B.p} />
          <OutBox label="Transferred tranche"    value={has ? fmtM(trancheN)    : 'n/a'} color={B.bl} />
          <OutBox label="RWA reduction"          value={has ? fmtM(rwaRed)      : 'n/a'} color={B.gr} />
          <OutBox label="Post-SRT RWA"           value={has ? fmtM(postRWA)     : 'n/a'} color={B.p} />
          <OutBox label="Capital freed"          value={has ? fmtM(capFreed)    : 'n/a'} color={B.gr} />
          <OutBox label="Annual protection cost" value={has ? fmtM(annCost)     : 'n/a'} color={B.am} />
          <OutBox label="Net annual benefit"     value={has ? fmtM(netBenefit)  : 'n/a'} color={netBenefit >= 0 ? B.gr : B.rd} />
          <OutBox label="Covered-RWA relief"     value={pctPt(redPct * 100)}              color={B.p} />
        </div>
        {has && mot.primary === 'Concentration management' && (
          <p style={{ margin:'12px 0 0', fontSize:11.5, color:B.s, lineHeight:1.6 }}>Concentration lens: the deal reduces synthetic exposure by about {fmtM(trancheN)} of risk while keeping the loans, versus an outright sale that would remove the full {fmtM(P)} and the client relationship. Retained risk after transfer is about {fmtM(P - trancheN)}.</p>
        )}
        {has && mot.primary === 'Portfolio growth capacity' && aRiskWeight > 0 && (
          <p style={{ margin:'12px 0 0', fontSize:11.5, color:B.s, lineHeight:1.6 }}>Growth lens: the RWA released supports roughly {fmtM(rwaRed / (aRiskWeight / 100))} of additional originations at the same average risk weight, without issuing common equity.</p>
        )}
        <p style={{ margin:'12px 0 0', fontSize:10.5, color:B.s, lineHeight:1.6 }}>Assumptions: target capital ratio {pctPt(capRatio)} (from the CET1 input); each point of tranche thickness modelled to release about 10 points of covered-pool RWA, capped at 90%; freed capital redeployed at 12% ROE. These are stylised illustrative figures, not a capital model. Estimated capital relief is not confirmed regulatory treatment and depends on a significant-risk-transfer assessment.</p>
      </div>

      {/* F – Alternatives */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="F" label="SRT versus alternatives" />
        <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0 12px' }}>How SRT compares with five other balance-sheet actions.</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {OS.alternatives.map(a => (
            <div key={a.name} style={{ padding:12, borderRadius:9, background:B.bg, border:`1px solid ${B.bd}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:B.p, marginBottom:8 }}>{a.name}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                <AltPill k="Capital" v={a.capital} /><AltPill k="Speed" v={a.speed} /><AltPill k="Cost" v={a.cost} />
                <AltPill k="Client" v={a.client} /><AltPill k="Complexity" v={a.complexity} />
              </div>
              <div style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
                <span style={{ color:B.bl, fontSize:9, fontWeight:700, marginTop:3 }}>↔</span>
                <span style={{ fontSize:11.5, color:B.s, lineHeight:1.6 }}>{a.vsSRT}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* G – Directions */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="G" label="Potential transaction direction" />
        <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0 12px' }}>One or two structure concepts to scope further.</div>
        <div style={{ display: wide ? 'grid' : 'flex', gridTemplateColumns: wide ? '1fr 1fr' : undefined, flexDirection:'column', gap:12 }}>
          {opp.directions.map(d => (
            <div key={d.h} style={{ padding:14, borderRadius:9, background:B.bg, border:`1px solid ${B.bd}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
                <span style={{ color:B.bl, fontSize:12 }}>⬛</span>
                <span style={{ fontSize:13, fontWeight:700, color:B.p }}>{d.h}</span>
              </div>
              <p style={{ margin:0, fontSize:12, color:B.s, lineHeight:1.6 }}>{d.s}</p>
            </div>
          ))}
        </div>
        <p style={{ margin:'12px 0 0', fontSize:11, color:B.s, fontFamily:ff('mono') }}>Note · indicative only · final regulatory capital relief is not guaranteed and depends on supervisory recognition, structure detail, and counterparty terms.</p>
      </div>

      {/* H – Questions */}
      <div style={{ background:B.card, border:`1px solid ${B.bd}`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="H" label="Key questions to ask next" />
        <div style={{ fontSize:15, fontWeight:700, color:B.p, margin:'8px 0 12px' }}>Diligence questions, plus questions grouped by who to ask.</div>
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {opp.questions.map((q, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9 }}>
              <span style={{ fontSize:10, fontWeight:700, color:B.bl, background:B.bl+'1e', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:ff('mono'), marginTop:1 }}>{i+1}</span>
              <span style={{ fontSize:12, color:B.p, lineHeight:1.6 }}>{q}</span>
            </div>
          ))}
        </div>
        <div style={{ height:1, background:B.bd, margin:'14px 0' }} />
        <div style={{ fontSize:9, fontWeight:700, color:B.s, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>BY AUDIENCE</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {OS.audienceQuestions(form).map(([audience, qs]) => (
            <div key={audience}>
              <div style={{ fontSize:12, fontWeight:700, color:B.bl, marginBottom:6 }}>{audience}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {qs.map(q => <Bullet key={q} text={q} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* I – Market next steps */}
      <div style={{ background:B.bl+'0d', border:`1px solid ${B.bl}40`, borderRadius:10, padding:16 }}>
        <CardEyebrow tag="I" label="Market next steps" />
        <p style={{ margin:'8px 0 12px', fontSize:13, color:B.s, lineHeight:1.6 }}>Three ways to act on this opportunity. Each one is routed through Gensaki and stays anonymized until both sides choose to engage.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { tag:'Bank / Credit Union', color:B.bl, label:'Request an anonymized protection spread quote', sub:'Share a no-name portfolio profile and receive an indicative protection-spread range from relevant investors. Your institution stays anonymous until you decide to engage.', btn:'Request quote', sheet:'bankQuote' as ActiveSheet },
            { tag:'Investor',            color:B.gr, label:'Send an anonymized investor expression of interest', sub:'Reach out to the bank or credit union through Gensaki with a no-name EOI covering mandate fit, target asset classes, structure preference, indicative spread appetite, and diligence needs.', btn:'Send investor EOI', sheet:'investorEOI' as ActiveSheet },
            { tag:'Advisor / Partner',   color:B.pu, label:'Send an anonymized partner expression of interest', sub:'Reach out to the bank or credit union through Gensaki with a no-name EOI from an advisor, arranger, insurer, counsel, accountant, data provider, or other execution partner.', btn:'Send partner EOI', sheet:'partnerEOI' as ActiveSheet },
          ].map(row => (
            <div key={row.tag} style={{ padding:14, borderRadius:9, background:B.card, border:`1px solid ${B.bd}`, display:'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : undefined, gap: wide ? 14 : 12 }}>
              <div style={{ flex:1 }}>
                <Bdg label={row.tag} color={row.color} dot />
                <div style={{ fontSize:14, fontWeight:700, color:B.p, margin:'6px 0 4px' }}>{row.label}</div>
                <p style={{ margin:0, fontSize:12, color:B.s, lineHeight:1.5 }}>{row.sub}</p>
              </div>
              <button onClick={() => setActiveSheet(row.sheet)}
                style={{ padding:'10px 16px', borderRadius:6, border:'none', background:B.bl, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:ff('geist'), whiteSpace:'nowrap', flexShrink:0 }}>
                {row.btn} →
              </button>
            </div>
          ))}
        </div>
        <p style={{ margin:'12px 0 0', fontSize:11, color:B.s, fontFamily:ff('mono') }}>Expressions of interest are directional and non-binding. No quote, investor or partner interest, capital relief, pricing, or transaction execution is guaranteed.</p>
      </div>

      {/* Caveat */}
      <div style={{ padding:14, background:B.bg, border:`1px solid ${B.bd}`, borderRadius:10 }}>
        <div style={{ fontSize:10, fontWeight:700, color:B.s, letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6 }}>CAVEAT</div>
        <p style={{ margin:0, fontSize:11, color:B.s, lineHeight:1.6 }}>This Opportunity Card is educational and directional. It is not legal, regulatory, accounting, tax, investment, or capital treatment advice. Any transaction-specific conclusion should be validated by qualified counsel, accountants, regulatory advisors, and relevant supervisory guidance.</p>
      </div>

      {/* Market sheets */}
      {activeSheet && <MarketModal sheet={activeSheet} form={form} opp={opp} mot={mot} onClose={() => setActiveSheet(null)} />}
    </div>
  );
}

// ─── MarketModal ──────────────────────────────────────────────────────────────

function MarketModal({ sheet, form, opp, mot, onClose }: {
  sheet: 'bankQuote' | 'investorEOI' | 'partnerEOI';
  form: SuitForm; opp: Opportunity;
  mot: { primary: string; others: string[]; why: string };
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [fields, setFields] = useState<Record<string,string>>({});
  const set = (k: string) => (v: string) => setFields(f => ({ ...f, [k]: v }));
  const direction = opp.directions[0]?.h ?? 'To be scoped';

  const title = sheet === 'bankQuote' ? 'Request anonymized protection spread quote'
    : sheet === 'investorEOI' ? 'Send anonymized investor expression of interest'
    : 'Send anonymized partner expression of interest';
  const submitLabel = sheet === 'bankQuote' ? 'Submit anonymized quote request'
    : sheet === 'investorEOI' ? 'Send anonymized investor EOI'
    : 'Send anonymized partner EOI';
  const confirmMsg = sheet === 'bankQuote'
    ? 'Quote request prepared. Gensaki can use this no-name profile to collect indicative spread feedback from relevant investors.'
    : sheet === 'investorEOI'
    ? 'Investor EOI prepared. Gensaki can share this anonymized interest signal with the bank or credit union.'
    : 'Partner EOI prepared. Gensaki can share this anonymized interest signal with the bank or credit union.';

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width:440, maxHeight:'92vh', overflowY:'auto', background:B.bg, borderLeft:`1px solid ${B.bd}`, borderTop:`1px solid ${B.bd}`, borderRadius:'20px 0 0 0', display:'flex', flexDirection:'column', boxShadow:'-4px 0 40px rgba(18,28,41,0.12)', fontFamily:ff('geist') }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, padding:'16px 18px 14px', background:B.bg, borderBottom:`1px solid ${B.bd}` }}>
          <span style={{ fontSize:17, fontWeight:800, color:B.p }}>{title}</span>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', border:`1px solid ${B.bd}`, background:B.card, cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:B.s, fontSize:13, fontWeight:700 }}>✕</button>
        </div>

        {submitted ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:24 }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:B.gr+'1e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, marginBottom:16, marginTop:32 }}>✓</div>
            <div style={{ fontSize:20, fontWeight:800, color:B.p, marginBottom:12 }}>Prepared</div>
            <p style={{ textAlign:'center', fontSize:13, color:B.s, maxWidth:280, lineHeight:1.6, marginBottom:12 }}>{confirmMsg}</p>
            <p style={{ textAlign:'center', fontSize:10.5, color:B.s, maxWidth:280, lineHeight:1.5 }}>Responses are directional and non-binding. No quote, expression of interest, investor or partner interest, capital relief, pricing, or transaction execution is guaranteed.</p>
            <button onClick={onClose} style={{ marginTop:24, padding:'12px 24px', borderRadius:8, border:'none', background:B.bl, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%' }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ flex:1, padding:18, display:'flex', flexDirection:'column', gap:14, overflowY:'auto' }}>
              {/* Anonymity note */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:12, borderRadius:9, background:B.bl+'0f', border:`1px solid ${B.bl}38` }}>
                <span style={{ color:B.bl, flexShrink:0 }}>🔒</span>
                <span style={{ fontSize:12, color:B.p }}>
                  {sheet === 'bankQuote' ? 'Gensaki will use an anonymized portfolio profile. Institution identity is not shared unless you approve a follow-up.'
                    : sheet === 'investorEOI' ? 'Your EOI will be routed through Gensaki. The bank or credit union remains anonymous unless both sides agree to engage.'
                    : 'This interest note is routed through Gensaki. The bank or credit union stays anonymous until there is mutual interest.'}
                </span>
              </div>

              {/* Read-only summary */}
              {(() => {
                const bankCells: [string,string][] = [
                  ['Institution type', form.institution], ['Jurisdiction', form.jurisdiction],
                  ['Portfolio type', form.portfolio], ['Portfolio size', form.portfolioSize ? `$${form.portfolioSize}M` : ''],
                  ['Capital ratio', form.capital ? `${form.capital}%` : ''], ['Credit quality', form.quality],
                  ['Primary goal', OS.goalLabel(form.goal)], ['Explored SRT', form.explored],
                ];
                const oppCells: [string,string][] = [
                  ['Jurisdiction', form.jurisdiction], ['Asset class', form.portfolio],
                  ['Portfolio size', form.portfolioSize ? `$${form.portfolioSize}M` : ''], ['Likely motive', mot.primary],
                  ['Structure direction', direction], ['Fit Score', `${opp.score} / 100`],
                ];
                const cells = sheet === 'bankQuote' ? bankCells : oppCells;
                return (
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:B.p, marginBottom:10 }}>
                      {sheet === 'bankQuote' ? 'Scan inputs · read-only' : 'Opportunity profile · read-only'}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {cells.map(([k,v]) => (
                        <div key={k} style={{ padding:10, borderRadius:8, background:B.bg, border:`1px solid ${B.bd}` }}>
                          <div style={{ fontSize:8.5, fontWeight:700, color:B.s, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:3 }}>{k}</div>
                          <div style={{ fontSize:12, fontWeight:700, color: v ? B.p : B.s, fontFamily:ff('mono') }}>{v || 'Not provided'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Form fields */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:B.p, marginBottom:10 }}>
                  {sheet === 'bankQuote' ? 'Your request' : sheet === 'investorEOI' ? 'Your expression of interest' : 'Your expression of interest'}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {sheet === 'bankQuote' && <>
                    <FMenu label="Target structure" value={fields.structure||''} onChange={set('structure')} options={['Funded credit-linked note','Unfunded guarantee (insurer-led)','Retained first-loss + mezzanine transfer','Open to recommendation','Not sure yet']} />
                    <FText label="Expected tranche thickness" value={fields.tranche||''} placeholder="e.g. 7" onChange={set('tranche')} suffix="%" />
                    <FMenu label="Preferred timing" value={fields.timing||''} onChange={set('timing')} options={['Exploratory only','Within 3 months','3 to 6 months','6 to 12 months','Timing not set']} />
                    <FTextArea label="Additional portfolio notes" value={fields.notes||''} placeholder="Optional context. No bank name, account numbers, or borrower names." onChange={set('notes')} />
                    <FText label="Contact email" value={fields.email||''} placeholder="you@institution.com" onChange={set('email')} />
                  </>}
                  {sheet === 'investorEOI' && <>
                    <FMenu label="Investor type" value={fields.investorType||''} onChange={set('investorType')} options={['Credit fund','Pension or allocator','Insurer or reinsurer','Family office','Bank treasury','Asset manager','Other']} />
                    <FText label="Mandate focus" value={fields.mandate||''} placeholder="e.g. regulatory capital, private credit" onChange={set('mandate')} />
                    <FText label="Target asset classes" value={fields.assetClasses||''} placeholder="e.g. CRE, C&I" onChange={set('assetClasses')} />
                    <FText label="Jurisdiction appetite" value={fields.jAppetite||''} placeholder="e.g. US, Canada, UK" onChange={set('jAppetite')} />
                    <FMenu label="Preferred structure" value={fields.structure||''} onChange={set('structure')} options={['Funded credit-linked note','Unfunded guarantee','Either, open to discussion']} />
                    <FText label="Indicative spread appetite" value={fields.spread||''} placeholder="e.g. 8 to 11% per year" onChange={set('spread')} />
                    <FText label="Target ticket size" value={fields.ticket||''} placeholder="e.g. 25 to 75" onChange={set('ticket')} prefix="$" suffix="M" />
                    <FTextArea label="Required diligence items" value={fields.diligence||''} placeholder="Data tape, loss history, structure terms, etc." onChange={set('diligence')} />
                    <FText label="Contact email" value={fields.email||''} placeholder="you@firm.com" onChange={set('email')} />
                  </>}
                  {sheet === 'partnerEOI' && <>
                    <FMenu label="Partner type" value={fields.partnerType||''} onChange={set('partnerType')} options={['Law firm or counsel','Arranger or structurer','Insurer','Accounting firm','Data or analytics provider','Rating or model validation','Other advisor']} />
                    <FText label="Organization role" value={fields.orgRole||''} placeholder="e.g. structuring counsel" onChange={set('orgRole')} />
                    <FText label="Relevant capability" value={fields.capability||''} placeholder="What you bring to this" onChange={set('capability')} />
                    <FText label="Proposed workstream" value={fields.workstream||''} placeholder="e.g. SRT documentation, model validation" onChange={set('workstream')} />
                    <FText label="Jurisdiction or asset-class focus" value={fields.focus||''} placeholder="e.g. US CRE" onChange={set('focus')} />
                    <FText label="Suggested next step" value={fields.nextStep||''} placeholder="e.g. introductory call" onChange={set('nextStep')} />
                    <FTextArea label="Conflicts / disclosures" value={fields.conflicts||''} placeholder="Any relevant conflicts or disclosures." onChange={set('conflicts')} />
                    <FText label="Contact email" value={fields.email||''} placeholder="you@firm.com" onChange={set('email')} />
                  </>}
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:10.5, color:B.s }}>
                <span style={{ flexShrink:0 }}>ℹ</span>
                <span>Responses are directional and non-binding. No quote, expression of interest, investor or partner interest, capital relief, pricing, or transaction execution is guaranteed. Gensaki routes anonymized signals only and shares your identity solely with your approval.</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:'12px 18px', background:B.bg, borderTop:`1px solid ${B.bd}`, display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={() => setSubmitted(true)}
                style={{ padding:'12px 0', borderRadius:8, border:'none', background:B.bl, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>
                {submitLabel} →
              </button>
              <button onClick={onClose}
                style={{ padding:'11px 0', borderRadius:8, border:`1px solid ${B.bd}`, background:B.card, color:B.s, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:ff('geist') }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── FitScoreView (root export) ───────────────────────────────────────────────

export default function FitScoreView({ onSelectItem }: { onSelectItem: (v: string | null) => void }) {
  const outerRef  = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);
  const [wide,      setWide]      = useState(false);

  const [step,       setStep]       = useState<Step>('landing');
  const [persona,    setPersona]    = useState('');
  const [inputMode,  setInputMode]  = useState('');   // 'lookup' | 'quick' | ''
  const [form,       setForm]       = useState<SuitForm>(emptyForm);
  const [isExample,  setIsExample]  = useState(false);

  const isLookup   = inputMode === 'lookup';
  const stepLabels = isLookup ? OS.lookupSteps : OS.steps;
  const stepIdx    = isLookup
    ? ({ landing:0, persona:0, mode:1, institutionSearch:2, form:3, loading:4, results:5 } as Record<Step,number>)[step]
    : ({ landing:0, persona:0, mode:1, institutionSearch:2, form:2, loading:3, results:4 } as Record<Step,number>)[step];

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setIsCompact(e.contentRect.width < 1080);
      setWide(e.contentRect.width > 900);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goExample = useCallback(() => {
    setPersona('bank');
    setForm(OS.exampleForm);
    setIsExample(true);
    setInputMode('');
    setStep('results');
  }, []);

  const applyPrefill = useCallback((r: InstitutionResult) => {
    setForm(f => ({
      ...f,
      institution:   r.institutionType  || f.institution,
      jurisdiction:  r.jurisdiction     || f.jurisdiction,
      assets:        r.assetsM          || f.assets,
      capital:       r.capitalPct       || f.capital,
      portfolio:     r.likelyPortfolio  || f.portfolio,
      portfolioSize: r.portfolioSizeM   || f.portfolioSize,
      quality:       r.creditQuality    || f.quality,
    }));
  }, []);

  function back() {
    switch (step) {
      case 'persona':           setStep('landing'); break;
      case 'mode':              setStep('persona'); break;
      case 'institutionSearch': setInputMode(''); setStep('mode'); break;
      case 'form':              isLookup ? setStep('institutionSearch') : (setInputMode(''), setStep('mode')); break;
      case 'results':           setStep('landing'); break;
      default: break;
    }
  }

  const hPad = isCompact ? 20 : 40;
  const isWizard = step !== 'landing';

  return (
    <div ref={outerRef} style={{ position:'relative', width:'100%', height:'100vh', overflow:'hidden' }}>
      <div ref={scrollRef} style={{ width:'100%', height:'100%', overflowY:'auto' }}>

        {/* Landing */}
        {step === 'landing' && (
          <>
            <HeaderNav isCompact={isCompact} scrollRef={scrollRef} selectedItem="FitScore" onSelectItem={onSelectItem} />
            <SuitLanding wide={wide} onStart={() => setStep('persona')} onExample={goExample} />
            <PageFooter isCompact={isCompact} />
          </>
        )}

        {/* Wizard */}
        {isWizard && (
          <div style={{ background:B.bg, minHeight:'100vh', fontFamily:ff('geist') }}>
            <HeaderNav isCompact={isCompact} scrollRef={scrollRef} selectedItem="FitScore" onSelectItem={onSelectItem} />
            <div style={{ height:80 }} />

            <div style={{ maxWidth:1180, margin:'0 auto', padding:`28px ${hPad}px 80px`, display:'flex', flexDirection:'column', gap:20 }}>
              {step !== 'loading' && (
                <StepBar steps={stepLabels} current={stepIdx} canBack onBack={back} />
              )}

              {step === 'persona' && (
                <SuitPersona wide={wide} persona={persona} onNext={p => { setPersona(p); setStep('mode'); }} />
              )}

              {step === 'mode' && (
                <SuitMode wide={wide} onPick={m => {
                  if (m === 'example') { goExample(); return; }
                  setInputMode(m);
                  setStep(m === 'lookup' ? 'institutionSearch' : 'form');
                }} />
              )}

              {step === 'institutionSearch' && (
                <SuitInstitutionSearch wide={wide}
                  onUse={r => { applyPrefill(r); setStep('form'); }}
                  onManual={() => setStep('form')} />
              )}

              {step === 'form' && (
                <SuitFormScreen wide={wide} form={form} onChange={setForm}
                  stepNo={isLookup ? 4 : 3}
                  onSubmit={() => setStep('loading')} />
              )}

              {step === 'loading' && <SuitLoading onDone={() => setStep('results')} />}

              {step === 'results' && (
                <SuitResults wide={wide} persona={persona || 'bank'} form={form} isExample={isExample} />
              )}
            </div>

            {/* Disclaimer footer */}
            <div style={{ padding:'4px 0 16px', textAlign:'center', fontSize:10, color:B.s, fontFamily:ff('geist') }}>
              Gensaki Intelligence · SRT Opportunity Scanner · Educational and directional, not legal, regulatory, accounting, tax, investment, or capital treatment advice.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
