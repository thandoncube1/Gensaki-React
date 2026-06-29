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
  bg:     '#FBFBF8', ink:  '#0E1410', ink2: '#2A312D', mute: '#6B7368',
  line:   '#E6E8E2', cyan: '#74E0FF', cyanInk: '#0B1D27',
  green:  '#2F9E69', mint1: '#E7F6EC', mint2: '#F1FBF3',
};

const FONT  = '"Geist", system-ui, sans-serif';
const MONO  = '"JetBrains Mono", "Courier New", monospace';

// ─── Types ────────────────────────────────────────────────────────────────────

type Persona = 'bank' | 'cu' | 'am' | 'ib';
type Mode    = 'explore' | 'assess' | 'market';
type Goal    = 'capital' | 'growth' | 'concentration' | 'liquidity' | 'yield' | 'diversification';
type Step    = 'landing' | 'persona' | 'mode' | 'institutionSearch' | 'form' | 'loading' | 'results';

interface SuitForm {
  institution:    string;
  jurisdiction:   string;
  assets:         string;
  capital:        string;
  portfolio:      string;
  portfolioSize:  string;
  goal:           string;
  quality:        string;
  explored:       string;
}

interface Institution {
  id:           string;
  name:         string;
  type:         string;
  jurisdiction: string;
  assets:       string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PERSONAS: { key: Persona; label: string; subtitle: string; icon: string }[] = [
  { key: 'bank', label: 'Bank CFO / Treasurer',              subtitle: 'Capital relief, RWA optimisation',      icon: '🏦' },
  { key: 'cu',   label: 'Credit Union CFO / Treasurer',      subtitle: 'Balance sheet management, ALM',         icon: '🤝' },
  { key: 'am',   label: 'Asset Manager',                     subtitle: 'Portfolio yield, diversification',      icon: '📊' },
  { key: 'ib',   label: 'Investment Banker / Analyst',       subtitle: 'Structuring, deal origination',         icon: '📐' },
];

const MODES: { key: Mode; label: string; subtitle: string }[] = [
  { key: 'explore', label: 'Explore',           subtitle: 'Walk through a demo with sample data' },
  { key: 'assess',  label: 'Run Assessment',    subtitle: 'Score a real institution for SRT suitability' },
  { key: 'market',  label: 'Market Opportunity', subtitle: 'Explore investor demand and market data' },
];

const JURISDICTIONS = ['United States', 'European Union', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'Other'];
const INSTITUTION_TYPES = ['Bank', 'Credit Union', 'Savings Institution', 'Foreign Banking Organisation'];
const PORTFOLIOS = ['CRE', 'C&I', 'Auto', 'Consumer', 'Student Loans', 'Equipment Finance', 'Mixed'];
const PORTFOLIO_SIZES = ['< $100M', '$100M – $500M', '$500M – $1B', '$1B – $5B', '$5B – $25B', '> $25B'];
const CREDIT_QUALITY = ['Strong', 'Moderate', 'Stressed', 'Unknown'];
const GOALS: { key: Goal; label: string }[] = [
  { key: 'capital',          label: 'Capital Relief'          },
  { key: 'growth',           label: 'Loan Growth'             },
  { key: 'concentration',    label: 'Concentration Management' },
  { key: 'liquidity',        label: 'Liquidity Management'    },
  { key: 'yield',            label: 'Yield Enhancement'       },
  { key: 'diversification',  label: 'Diversification'         },
];

const INSTITUTIONS: Institution[] = [
  { id: 'us-pinnacle',   name: 'Pinnacle Financial Partners', type: 'Bank',         jurisdiction: 'United States', assets: '47,200' },
  { id: 'us-summit',     name: 'Summit Community Bank',       type: 'Bank',         jurisdiction: 'United States', assets: '2,100'  },
  { id: 'ca-cascade',    name: 'Cascade Credit Union',        type: 'Credit Union', jurisdiction: 'Canada',        assets: '890'    },
  { id: 'us-frontier',   name: 'Frontier State Bank',         type: 'Bank',         jurisdiction: 'United States', assets: '680'    },
  { id: 'us-harbor',     name: 'Harbor Federal Savings',      type: 'Bank',         jurisdiction: 'United States', assets: '3,400'  },
  { id: 'ca-mapleridge', name: 'Maple Ridge Credit Union',    type: 'Credit Union', jurisdiction: 'Canada',        assets: '1,250'  },
];

const LOAD_STEPS = [
  'Analysing institution profile…',
  'Scoring capital structure…',
  'Evaluating portfolio composition…',
  'Computing fit score…',
  'Generating recommendations…',
];

const EXAMPLE_FORM: SuitForm = {
  institution:   'Bank',
  jurisdiction:  'United States',
  assets:        '38,500',
  capital:       '11.2',
  portfolio:     'CRE',
  portfolioSize: '$5B – $25B',
  goal:          'capital',
  quality:       'Moderate',
  explored:      'No',
};

// ─── Scoring ──────────────────────────────────────────────────────────────────

function parseNum(s: string) {
  return parseFloat(s.replace(/,/g, '')) || 0;
}

function computeScore(f: SuitForm): number {
  let s = 45;

  if (f.institution === 'Bank')         s += 12;
  else if (f.institution === 'Credit Union') s += 6;

  if (['United States','European Union','United Kingdom'].includes(f.jurisdiction)) s += 12;
  else if (f.jurisdiction === 'Canada') s += 8;

  const assets = parseNum(f.assets);
  if (assets > 50000) s += 12;
  else if (assets > 10000) s += 8;
  else if (assets > 1000)  s += 4;

  const cap = parseFloat(f.capital) || 0;
  if (cap < 11)   s += 10;
  else if (cap < 13) s += 7;
  else if (cap < 16) s += 4;

  if (f.portfolio === 'CRE' || f.portfolio === 'C&I') s += 12;

  const psMap: Record<string, number> = {
    '> $25B': 8, '$5B – $25B': 6, '$1B – $5B': 4, '$500M – $1B': 2,
  };
  s += (psMap[f.portfolioSize] ?? 0);

  if (f.goal === 'capital') s += 9;
  else if (f.goal === 'growth' || f.goal === 'concentration') s += 8;

  if (f.quality === 'Strong')  s += 4;
  else if (f.quality === 'Stressed') s -= 4;

  if (f.explored === 'Yes') s += 4;

  return Math.min(95, Math.max(15, s));
}

function ratingFor(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Strong Fit',       color: B.gr };
  if (score >= 65) return { label: 'Promising Fit',    color: B.gr };
  if (score >= 50) return { label: 'Worth Exploring',  color: B.am };
  return               { label: 'Limited Fit',         color: B.s  };
}

function motivesFor(goal: string): string[] {
  const map: Record<string, string[]> = {
    capital:         ['Reduce RWA burden', 'Improve CET1 ratio', 'Unlock lending capacity'],
    growth:          ['Originate more loans', 'Expand market share', 'Access new borrowers'],
    concentration:   ['Reduce single-name exposure', 'Rebalance portfolio', 'Meet regulatory limits'],
    liquidity:       ['Improve LCR / NSFR', 'Reduce funding cost', 'Diversify funding sources'],
    yield:           ['Enhance NIM', 'Optimise risk-adjusted return', 'Outperform peers'],
    diversification: ['Add asset class exposure', 'Reduce correlation risk', 'Build resilient portfolio'],
  };
  return map[goal] ?? [];
}

function alternativesFor(goal: string): { label: string; note: string }[] {
  const map: Record<string, { label: string; note: string }[]> = {
    capital: [
      { label: 'CLO issuance',         note: 'Broad investor base but full de-recognition harder to achieve' },
      { label: 'Covered bonds',         note: 'Retained on-balance-sheet; no capital relief' },
      { label: 'Whole-loan sales',      note: 'Clean transfer but relationship and servicing costs' },
    ],
    growth: [
      { label: 'Warehouse facilities', note: 'Fast origination but revolving exposure stays on balance sheet' },
      { label: 'Loan syndication',     note: 'Scalable but requires origination infrastructure' },
    ],
    concentration: [
      { label: 'CDS / CLNs',           note: 'Synthetic hedging without removing assets' },
      { label: 'Bilateral loan sales',  note: 'Permanent removal but one-time gain or loss' },
    ],
    liquidity: [
      { label: 'FHLB advances',        note: 'Low-cost but overcollateralised and capacity-constrained' },
      { label: 'Repo facilities',       note: 'Flexible tenor but mark-to-market risk' },
    ],
    yield: [
      { label: 'CLO equity tranche',   note: 'High yield but first-loss risk and illiquidity' },
      { label: 'Direct lending',        note: 'Attractive spread but complex underwriting' },
    ],
    diversification: [
      { label: 'ABS participation',    note: 'Broad exposure but secondary market liquidity varies' },
      { label: 'ETF / index funds',    note: 'Liquid but indirect exposure' },
    ],
  };
  return map[goal] ?? [];
}

// ─── Score Gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const R  = 68;
  const CX = 88;
  const CY = 88;
  const CIRC = 2 * Math.PI * R;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const dur = 1200;
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
    <div style={{ position: 'relative', width: 176, height: 176 }}>
      <svg width={176} height={176} viewBox="0 0 176 176" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={B.bd} strokeWidth={12} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={color} strokeWidth={12}
          strokeDasharray={`${filled} ${CIRC}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.05s linear' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span style={{ fontSize: 42, fontWeight: 700, color: B.p, fontFamily: FONT, lineHeight: 1 }}>{displayed}</span>
        <span style={{ fontSize: 11, color: B.s, fontFamily: FONT, letterSpacing: '0.06em', textTransform: 'uppercase' }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Step Bar ─────────────────────────────────────────────────────────────────

const STEP_KEYS: Step[] = ['persona','mode','institutionSearch','form','loading','results'];
const STEP_LABELS = ['Profile','Mode','Institution','Details','Scoring','Results'];

function StepBar({ current }: { current: Step }) {
  const idx = STEP_KEYS.indexOf(current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, fontFamily: FONT }}>
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%',
              background: i < idx ? B.bl : i === idx ? B.bl : B.bd,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i < idx
                ? <span style={{ color: '#fff', fontSize: 13 }}>✓</span>
                : <span style={{ fontSize: 11, fontWeight: 600,
                    color: i === idx ? '#fff' : B.s }}>{i + 1}</span>
              }
            </div>
            <span style={{ fontSize: 10, color: i === idx ? B.p : B.s, fontWeight: i === idx ? 600 : 400,
              letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < idx ? B.bl : B.bd,
              margin: '0 6px', marginBottom: 20, minWidth: 20 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function FLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontSize: 12, fontWeight: 600, color: B.s, letterSpacing: '0.06em',
    textTransform: 'uppercase', fontFamily: FONT, display: 'block', marginBottom: 6 }}>{children}</label>;
}

function FSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <FLabel>{label}</FLabel>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${B.bd}`,
          fontSize: 14, fontFamily: FONT, color: B.p, background: B.card,
          appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%2359697A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
          paddingRight: 32, cursor: 'pointer', outline: 'none' }}>
        <option value="">— select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FText({ label, value, placeholder, onChange }: {
  label: string; value: string; placeholder?: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <FLabel>{label}</FLabel>
      <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${B.bd}`,
          fontSize: 14, fontFamily: FONT, color: B.p, background: B.card, outline: 'none' }} />
    </div>
  );
}

// ─── Pill / Tag ───────────────────────────────────────────────────────────────

function Pill({ label, color = B.bl }: { label: string; color?: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100,
      background: color + '18', color, fontSize: 12, fontWeight: 600, fontFamily: FONT }}>
      {label}
    </span>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: B.card, border: `1px solid ${B.bd}`, borderRadius: 14,
      padding: 24, ...style }}>
      {children}
    </div>
  );
}

// ─── Hero Tranche Stack (landing visual) ──────────────────────────────────────

function HeroTrancheStack() {
  const tranches = [
    { label: 'Senior',      pct: '65%', color: B.gr,   h: 56 },
    { label: 'Mezzanine',   pct: '20%', color: B.am,   h: 36 },
    { label: 'Subordinate', pct: '10%', color: B.bl,   h: 28 },
    { label: 'Equity',      pct: '5%',  color: B.rd,   h: 20 },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 260 }}>
      {tranches.map(t => (
        <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: t.h, borderRadius: 6, background: t.color + '22',
            border: `1px solid ${t.color}44`, display: 'flex', alignItems: 'center',
            paddingLeft: 12, gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: t.color, fontFamily: FONT }}>{t.label}</span>
            <span style={{ fontSize: 11, color: t.color + 'aa', fontFamily: MONO }}>{t.pct}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Hero Flow Visual ─────────────────────────────────────────────────────────

function HeroFlow() {
  const nodes = [
    { label: 'Bank Portfolio',   sub: '$38.5B assets',    color: C.green },
    { label: 'SRT Structure',    sub: 'Risk transfer',    color: C.cyan  },
    { label: 'Fit Score',        sub: '82 / 100',         color: C.green },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {nodes.map((n, i) => (
        <React.Fragment key={n.label}>
          <div style={{ padding: '12px 18px', borderRadius: 10,
            background: n.color === C.green ? C.mint1 : '#E8F9FF',
            border: `1px solid ${n.color}40`, minWidth: 140 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: FONT }}>{n.label}</div>
            <div style={{ fontSize: 11, color: C.mute, fontFamily: MONO, marginTop: 2 }}>{n.sub}</div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{ width: 32, height: 1, background: C.line, position: 'relative', flexShrink: 0 }}>
              <span style={{ position: 'absolute', right: -4, top: -7, fontSize: 14, color: C.mute }}>›</span>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── SuitLanding ──────────────────────────────────────────────────────────────

function SuitLanding({ onStart }: { onStart: () => void }) {
  const hPad = 40;
  const bg   = `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: bg, fontFamily: FONT }}>
      {/* nav spacer */}
      <div style={{ height: 80 }} />

      {/* hero */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: `0 ${hPad}px` }}>
        <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 100,
              background: C.mint1, border: `1px solid ${C.green}30` }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.green, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                SRT Opportunity Scanner
              </span>
            </div>

            <div>
              <h1 style={{ fontSize: 56, fontWeight: 700, color: C.ink, lineHeight: 1.08,
                margin: 0, letterSpacing: '-0.025em' }}>
                Is your institution<br />
                <span style={{ color: C.green }}>SRT-ready?</span>
              </h1>
              <p style={{ fontSize: 20, color: C.mute, margin: '20px 0 0', lineHeight: 1.6, fontWeight: 400 }}>
                Score your bank or credit union for Significant Risk Transfer suitability in under 3 minutes.
                Get a tailored assessment, capital impact estimate, and actionable next steps.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={onStart}
                style={{ padding: '14px 28px', borderRadius: 10, border: 'none',
                  background: C.ink, color: '#fff', fontSize: 15, fontWeight: 600,
                  fontFamily: FONT, cursor: 'pointer' }}>
                Run Assessment →
              </button>
              <button onClick={onStart}
                style={{ padding: '14px 28px', borderRadius: 10, border: `1.5px solid ${C.line}`,
                  background: 'transparent', color: C.ink2, fontSize: 15, fontWeight: 500,
                  fontFamily: FONT, cursor: 'pointer' }}>
                Explore Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* visuals strip */}
      <div style={{ padding: `40px ${hPad}px`, borderTop: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 40,
          alignItems: 'center', flexWrap: 'wrap' }}>
          <HeroFlow />
          <div style={{ flex: 1, minWidth: 200 }}>
            <HeroTrancheStack />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: '140+', sub: 'SRT transactions scored' },
              { label: '18',   sub: 'jurisdictions covered'   },
              { label: '94%',  sub: 'accuracy vs. mandates'   },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.ink, fontFamily: MONO }}>{s.label}</span>
                <span style={{ fontSize: 13, color: C.mute }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SuitPersona ──────────────────────────────────────────────────────────────

function SuitPersona({ onSelect, onBack }: {
  onSelect: (p: Persona) => void; onBack: () => void;
}) {
  return (
    <WizardShell onBack={onBack} title="Who are you?" subtitle="Select your role to personalise the assessment.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {PERSONAS.map(p => (
          <button key={p.key} onClick={() => onSelect(p.key)}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20,
              borderRadius: 12, border: `1.5px solid ${B.bd}`, background: B.card,
              textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s',
              fontFamily: FONT }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = B.bl)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = B.bd)}>
            <span style={{ fontSize: 28 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: B.p }}>{p.label}</div>
              <div style={{ fontSize: 13, color: B.s, marginTop: 4 }}>{p.subtitle}</div>
            </div>
          </button>
        ))}
      </div>
    </WizardShell>
  );
}

// ─── SuitMode ─────────────────────────────────────────────────────────────────

function SuitMode({ persona, onSelect, onBack }: {
  persona: Persona; onSelect: (m: Mode) => void; onBack: () => void;
}) {
  const personaLabel = PERSONAS.find(p => p.key === persona)?.label ?? persona;
  return (
    <WizardShell onBack={onBack} title="What would you like to do?"
      subtitle={`Signed in as: ${personaLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
        {MODES.map(m => (
          <button key={m.key} onClick={() => onSelect(m.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
              borderRadius: 12, border: `1.5px solid ${B.bd}`, background: B.card,
              textAlign: 'left', cursor: 'pointer', fontFamily: FONT }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = B.bl)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = B.bd)}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: B.bg,
              border: `1px solid ${B.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0 }}>
              {m.key === 'explore' ? '🔍' : m.key === 'assess' ? '📋' : '📈'}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: B.p }}>{m.label}</div>
              <div style={{ fontSize: 13, color: B.s, marginTop: 2 }}>{m.subtitle}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: B.s, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </WizardShell>
  );
}

// ─── Institution Search ───────────────────────────────────────────────────────

function SuitInstitutionSearch({ onSelect, onSkip, onBack }: {
  onSelect: (inst: Institution) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = INSTITUTIONS.filter(i =>
    i.name.toLowerCase().includes(query.toLowerCase()) ||
    i.type.toLowerCase().includes(query.toLowerCase()) ||
    i.jurisdiction.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <WizardShell onBack={onBack} title="Find your institution"
      subtitle="Search our database or skip to enter details manually.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, type, or jurisdiction…"
          style={{ padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${B.bd}`,
            fontSize: 15, fontFamily: FONT, color: B.p, outline: 'none' }} />

        {filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(inst => (
              <button key={inst.id} onClick={() => onSelect(inst)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 10, border: `1px solid ${B.bd}`, background: B.card,
                  textAlign: 'left', cursor: 'pointer', fontFamily: FONT }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = B.bl)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = B.bd)}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: B.bg,
                  border: `1px solid ${B.bd}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {inst.type === 'Credit Union' ? '🤝' : '🏦'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.p }}>{inst.name}</div>
                  <div style={{ fontSize: 12, color: B.s, marginTop: 2 }}>
                    {inst.type} · {inst.jurisdiction} · ${inst.assets}M assets
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && filtered.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: B.s, fontSize: 14 }}>
            No institutions found. Enter details manually below.
          </div>
        )}

        <button onClick={onSkip}
          style={{ padding: '12px 20px', borderRadius: 10, border: `1.5px solid ${B.bd}`,
            background: 'transparent', color: B.s, fontSize: 14, fontWeight: 500,
            fontFamily: FONT, cursor: 'pointer', alignSelf: 'flex-start' }}>
          Enter manually →
        </button>
      </div>
    </WizardShell>
  );
}

// ─── SuitForm Screen ──────────────────────────────────────────────────────────

function SuitFormScreen({ form, onChange, onSubmit, onDemo, onBack }: {
  form: SuitForm;
  onChange: (f: SuitForm) => void;
  onSubmit: () => void;
  onDemo: () => void;
  onBack: () => void;
}) {
  const set = (k: keyof SuitForm) => (v: string) => onChange({ ...form, [k]: v });
  const goalLabel = GOALS.find(g => g.key === form.goal)?.label ?? '';

  const valid = form.institution && form.jurisdiction && form.assets && form.capital &&
    form.portfolio && form.portfolioSize && form.goal && form.quality && form.explored;

  return (
    <WizardShell onBack={onBack} title="Institution Details"
      subtitle="Complete the form to compute your SRT suitability score.">
      <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FSelect label="Institution Type" value={form.institution}
            options={INSTITUTION_TYPES} onChange={set('institution')} />
          <FSelect label="Jurisdiction" value={form.jurisdiction}
            options={JURISDICTIONS} onChange={set('jurisdiction')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FText label="Total Assets ($M)" value={form.assets}
            placeholder="e.g. 38,500" onChange={set('assets')} />
          <FText label="CET1 Ratio (%)" value={form.capital}
            placeholder="e.g. 11.2" onChange={set('capital')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <FSelect label="Target Portfolio" value={form.portfolio}
            options={PORTFOLIOS} onChange={set('portfolio')} />
          <FSelect label="Portfolio Size" value={form.portfolioSize}
            options={PORTFOLIO_SIZES} onChange={set('portfolioSize')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <FLabel>Primary Goal</FLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {GOALS.map(g => (
                <label key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', padding: '8px 12px', borderRadius: 8,
                  background: form.goal === g.key ? B.bl + '12' : 'transparent',
                  border: `1px solid ${form.goal === g.key ? B.bl : B.bd}`,
                  transition: 'all 0.15s' }}>
                  <input type="radio" name="goal" value={g.key} checked={form.goal === g.key}
                    onChange={() => set('goal')(g.key)}
                    style={{ accentColor: B.bl }} />
                  <span style={{ fontSize: 13, color: B.p, fontFamily: FONT }}>{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FSelect label="Credit Quality" value={form.quality}
              options={CREDIT_QUALITY} onChange={set('quality')} />
            <div>
              <FLabel>SRT Explored Before?</FLabel>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Yes', 'No'].map(v => (
                  <button key={v} onClick={() => set('explored')(v)}
                    style={{ flex: 1, padding: '10px', borderRadius: 8,
                      border: `1.5px solid ${form.explored === v ? B.bl : B.bd}`,
                      background: form.explored === v ? B.bl + '10' : 'transparent',
                      color: form.explored === v ? B.bl : B.s, fontWeight: 600,
                      fontSize: 14, fontFamily: FONT, cursor: 'pointer' }}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {form.goal && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: B.bl + '08',
            border: `1px solid ${B.bl}22`, fontSize: 13, color: B.s, fontFamily: FONT }}>
            Goal: <strong style={{ color: B.p }}>{goalLabel}</strong> — {motivesFor(form.goal)[0]}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onSubmit} disabled={!valid}
            style={{ padding: '14px 28px', borderRadius: 10, border: 'none',
              background: valid ? B.bl : B.bd, color: valid ? '#fff' : B.s,
              fontSize: 15, fontWeight: 600, fontFamily: FONT, cursor: valid ? 'pointer' : 'default',
              transition: 'all 0.15s' }}>
            Compute Score →
          </button>
          <button onClick={onDemo}
            style={{ padding: '14px 20px', borderRadius: 10, border: `1.5px solid ${B.bd}`,
              background: 'transparent', color: B.s, fontSize: 14, fontFamily: FONT, cursor: 'pointer' }}>
            Load Example
          </button>
        </div>
      </div>
    </WizardShell>
  );
}

// ─── SuitLoading ──────────────────────────────────────────────────────────────

function SuitLoading({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < LOAD_STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [step, onDone]);

  const pct = Math.round(((step + 1) / LOAD_STEPS.length) * 100);

  return (
    <WizardShell onBack={() => {}} title="" subtitle="">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 32, padding: '40px 0', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ position: 'relative', width: 100, height: 100 }}>
          <svg width={100} height={100} viewBox="0 0 100 100"
            style={{ transform: 'rotate(-90deg)', animation: 'spin 2s linear infinite' }}>
            <style>{`@keyframes spin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }`}</style>
            <circle cx={50} cy={50} r={40} fill="none" stroke={B.bd} strokeWidth={6} />
            <circle cx={50} cy={50} r={40} fill="none" stroke={B.bl} strokeWidth={6}
              strokeDasharray={`${pct * 2.513} 251.3`} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, fontWeight: 700, color: B.p, fontFamily: FONT }}>
            {pct}%
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: B.p, fontFamily: FONT, marginBottom: 8 }}>
            Scoring your institution
          </div>
          <div style={{ fontSize: 14, color: B.s, fontFamily: FONT, minHeight: 20 }}>
            {LOAD_STEPS[step]}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          {LOAD_STEPS.map((ls, i) => (
            <div key={ls} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: i < step ? B.gr : i === step ? B.bl : B.bd,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                {i < step && <span style={{ color: '#fff' }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: i <= step ? B.p : B.s, fontFamily: FONT,
                transition: 'color 0.3s' }}>{ls}</span>
            </div>
          ))}
        </div>
      </div>
    </WizardShell>
  );
}

// ─── SuitResults ──────────────────────────────────────────────────────────────

function SuitResults({ form, score, persona, onRestart, onQuote, onInvestorEOI, onPartnerEOI }: {
  form:        SuitForm;
  score:       number;
  persona:     Persona;
  onRestart:   () => void;
  onQuote:     () => void;
  onInvestorEOI: () => void;
  onPartnerEOI:  () => void;
}) {
  const { label: ratingLabel, color: ratingColor } = ratingFor(score);
  const motives = motivesFor(form.goal);
  const alts    = alternativesFor(form.goal);
  const goalLabel = GOALS.find(g => g.key === form.goal)?.label ?? form.goal;

  const isBank    = persona === 'bank' || persona === 'cu';
  const isInvestor = persona === 'am';
  const isPartner  = persona === 'ib';

  const capEstimate = (() => {
    const ps     = parseNum(form.portfolioSize.replace(/[^0-9]/g, '')) || 1000;
    const rwa    = ps * 0.65;
    const relief = (rwa * 0.08 * (score / 100)).toFixed(0);
    return relief;
  })();

  return (
    <WizardShell onBack={onRestart} title="" subtitle="">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>

        {/* A – Score header */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <ScoreGauge score={score} color={ratingColor} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Pill label={ratingLabel} color={ratingColor} />
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: B.p, fontFamily: FONT }}>
              SRT Suitability Score
            </h2>
            <p style={{ margin: 0, fontSize: 15, color: B.s, fontFamily: FONT }}>
              Based on {form.institution} in {form.jurisdiction} with ${form.assets}M assets
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {isBank    && <ActionBtn label="Request Quote" color={B.bl} onClick={onQuote} />}
              {isInvestor && <ActionBtn label="Investor EOI"  color={B.gr} onClick={onInvestorEOI} />}
              {isPartner  && <ActionBtn label="Partner EOI"   color={B.pu} onClick={onPartnerEOI} />}
              <ActionBtn label="Start Over" color={B.s} onClick={onRestart} outline />
            </div>
          </div>
        </div>

        {/* B – Why this rating */}
        <Card>
          <SectionHead>Why this rating</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {[
              { label: 'Institution type',  val: form.institution,  note: form.institution === 'Bank' ? '+12 pts' : '+6 pts' },
              { label: 'Jurisdiction',       val: form.jurisdiction, note: ['United States','European Union','United Kingdom'].includes(form.jurisdiction) ? '+12 pts' : form.jurisdiction === 'Canada' ? '+8 pts' : '0 pts' },
              { label: 'CET1 ratio',         val: `${form.capital}%`, note: parseFloat(form.capital) < 11 ? '+10 pts' : parseFloat(form.capital) < 13 ? '+7 pts' : parseFloat(form.capital) < 16 ? '+4 pts' : '0 pts' },
              { label: 'Portfolio type',     val: form.portfolio,    note: ['CRE','C&I'].includes(form.portfolio) ? '+12 pts' : '0 pts' },
              { label: 'Primary goal',       val: goalLabel,         note: form.goal === 'capital' ? '+9 pts' : ['growth','concentration'].includes(form.goal) ? '+8 pts' : '0 pts' },
              { label: 'Credit quality',     val: form.quality,      note: form.quality === 'Strong' ? '+4 pts' : form.quality === 'Stressed' ? '−4 pts' : '0 pts' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${B.bd}` }}>
                <span style={{ fontSize: 14, color: B.s, fontFamily: FONT }}>{r.label}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: B.p, fontWeight: 500, fontFamily: FONT }}>{r.val}</span>
                  <span style={{ fontSize: 12, color: ratingColor, fontFamily: MONO, width: 60, textAlign: 'right' }}>{r.note}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* C – Capital Impact */}
        <Card>
          <SectionHead>Estimated Capital Impact</SectionHead>
          <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
            <StatBlock label="RWA relief estimate" value={`$${capEstimate}M`} color={B.gr} />
            <StatBlock label="CET1 improvement"    value={`~${(score / 100 * 1.4).toFixed(1)}%`} color={B.bl} />
            <StatBlock label="Lending headroom"    value={`$${Math.round(parseNum(capEstimate) * 12.5)}M`} color={B.pu} />
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: B.s, fontFamily: FONT }}>
            Estimates assume 65% portfolio RWA weight and 8% minimum CET1 hurdle. Actual figures depend on transaction structure and regulatory approval.
          </p>
        </Card>

        {/* D – Portfolio Fit */}
        <Card>
          <SectionHead>Portfolio Fit</SectionHead>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Portfolio type',  val: form.portfolio,       fit: ['CRE','C&I'].includes(form.portfolio) },
              { label: 'Portfolio size',  val: form.portfolioSize,   fit: true },
              { label: 'Credit quality',  val: form.quality,         fit: form.quality !== 'Stressed' },
              { label: 'SRT explored',    val: form.explored,        fit: form.explored === 'Yes' },
            ].map(r => (
              <div key={r.label} style={{ padding: '12px 14px', borderRadius: 10,
                background: r.fit ? B.gr + '0a' : B.rd + '0a',
                border: `1px solid ${r.fit ? B.gr : B.rd}22`,
                display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>{r.fit ? '✓' : '!'}</span>
                <div>
                  <div style={{ fontSize: 12, color: B.s, fontFamily: FONT }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.p, fontFamily: FONT }}>{r.val}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* E – Regulatory Context */}
        <Card>
          <SectionHead>Regulatory Context</SectionHead>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Basel III / IV compliance', body: 'SRT transactions must achieve significant risk transfer under CRR Art. 243/244 or Basel framework equivalents. Synthetic SRT via CLN/CDS is acceptable in most G10 jurisdictions.' },
              { title: 'Jurisdiction',               body: `${form.jurisdiction} regulators ${['United States','European Union','United Kingdom'].includes(form.jurisdiction) ? 'have well-established SRT frameworks' : 'are developing SRT guidance — early engagement with supervisors is recommended'}.` },
              { title: 'Originator retention',       body: 'Minimum 5% net economic interest required (EU/UK). US prudential standards apply equivalent substance-over-form tests.' },
            ].map(r => (
              <div key={r.title} style={{ padding: '12px 14px', borderRadius: 10,
                background: B.bg, border: `1px solid ${B.bd}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: B.p, fontFamily: FONT, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: B.s, fontFamily: FONT, lineHeight: 1.5 }}>{r.body}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* F – Alternatives */}
        <Card>
          <SectionHead>Alternatives Considered</SectionHead>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alts.map(a => (
              <div key={a.label} style={{ display: 'flex', gap: 12, padding: '10px 0',
                borderBottom: `1px solid ${B.bd}` }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: B.p, fontFamily: FONT, minWidth: 180 }}>{a.label}</span>
                <span style={{ fontSize: 13, color: B.s, fontFamily: FONT }}>{a.note}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* G – Key Risks */}
        <Card>
          <SectionHead>Key Risks</SectionHead>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { risk: 'Regulatory non-recognition', severity: 'High',   note: 'Supervisor may challenge SRT status if transfer is not sufficiently significant.' },
              { risk: 'Basis risk',                  severity: 'Medium', note: 'Synthetic structures may not perfectly hedge economic exposure.' },
              { risk: 'Operational complexity',       severity: 'Medium', note: 'Reporting, waterfall tracking, and investor servicing require robust infrastructure.' },
              { risk: 'Market liquidity',             severity: form.quality === 'Stressed' ? 'High' : 'Low', note: 'Secondary market for SRT protection depends on credit quality and macro conditions.' },
            ].map(r => (
              <div key={r.risk} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 0', borderBottom: `1px solid ${B.bd}` }}>
                <Pill label={r.severity} color={r.severity === 'High' ? B.rd : r.severity === 'Medium' ? B.am : B.gr} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.p, fontFamily: FONT }}>{r.risk}</div>
                  <div style={{ fontSize: 13, color: B.s, fontFamily: FONT, marginTop: 2 }}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* H – Motivations */}
        <Card>
          <SectionHead>What drives this decision</SectionHead>
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {motives.map(m => (
              <div key={m} style={{ padding: '8px 14px', borderRadius: 8, background: B.bg,
                border: `1px solid ${B.bd}`, fontSize: 14, color: B.p, fontFamily: FONT }}>
                {m}
              </div>
            ))}
          </div>
        </Card>

        {/* I – Next Steps */}
        <Card>
          <SectionHead>Recommended Next Steps</SectionHead>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { n: '01', label: 'Engage your regulator',         body: 'Initiate supervisory dialogue early. Regulatory pre-approval can reduce execution risk by 40%.' },
              { n: '02', label: 'Portfolio selection and sizing', body: 'Work with your structuring team to identify the reference portfolio and optimal tranche sizing.' },
              { n: '03', label: 'Investor outreach',             body: 'SRT investors include insurance companies, pension funds, and specialist credit funds. Begin confidential outreach.' },
              { n: '04', label: 'Legal and documentation',       body: 'Engage external counsel for CLN / CDS documentation and prospectus preparation (if applicable).' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 16, padding: '14px 0',
                borderBottom: `1px solid ${B.bd}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: B.bl, fontFamily: MONO,
                  flexShrink: 0, marginTop: 2 }}>{s.n}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.p, fontFamily: FONT }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: B.s, fontFamily: FONT, marginTop: 3 }}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            {isBank    && <ActionBtn label="Request a Bank Quote"     color={B.bl} onClick={onQuote} />}
            {isInvestor && <ActionBtn label="Submit Investor Interest" color={B.gr} onClick={onInvestorEOI} />}
            {isPartner  && <ActionBtn label="Explore Partnership"      color={B.pu} onClick={onPartnerEOI} />}
          </div>
        </Card>

      </div>
    </WizardShell>
  );
}

// ─── Modal Sheets ─────────────────────────────────────────────────────────────

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
      alignItems: 'flex-end', justifyContent: 'flex-end' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: 440, maxHeight: '92vh', overflowY: 'auto', background: B.card,
          borderLeft: `1px solid ${B.bd}`, borderTop: `1px solid ${B.bd}`,
          borderRadius: '20px 0 0 0', padding: 32, boxShadow: '-4px 0 40px rgba(18,28,41,0.12)',
          display: 'flex', flexDirection: 'column', gap: 20 }}>
        <button onClick={onClose}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: B.s, fontFamily: FONT, padding: 0 }}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function SheetField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${B.bd}`,
          fontSize: 14, fontFamily: FONT, color: B.p, boxSizing: 'border-box', outline: 'none' }} />
    </div>
  );
}

function SubmitBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: '13px 24px', borderRadius: 10, border: 'none', background: color,
        color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: FONT, cursor: 'pointer', width: '100%' }}>
      {label}
    </button>
  );
}

function BankQuoteModal({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [bank, setBank]   = useState('');
  const [notes, setNotes] = useState('');

  return (
    <ModalOverlay onClose={onClose}>
      <div>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: B.p, fontFamily: FONT }}>Request a Bank Quote</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: B.s, fontFamily: FONT }}>
          Our structuring desk will follow up within 48 hours with a tailored SRT indicative quote.
        </p>
      </div>
      <SheetField label="Your Name"         value={name}  onChange={setName}  />
      <SheetField label="Work Email"        value={email} onChange={setEmail} />
      <SheetField label="Bank / Institution" value={bank}  onChange={setBank}  />
      <div>
        <FLabel>Additional Notes</FLabel>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${B.bd}`,
            fontSize: 14, fontFamily: FONT, color: B.p, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
      </div>
      <SubmitBtn label="Submit Request" color={B.bl} onClick={onClose} />
    </ModalOverlay>
  );
}

function InvestorEOIModal({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [firm, setFirm]   = useState('');
  const [type, setType]   = useState('');
  const [size, setSize]   = useState('');

  const investorTypes = ['Insurance', 'Pension Fund', 'Asset Manager', 'Family Office', 'Bank', 'Hedge Fund'];
  const sizeBands     = ['< $50M', '$50M – $250M', '$250M – $1B', '> $1B'];

  return (
    <ModalOverlay onClose={onClose}>
      <div>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: B.p, fontFamily: FONT }}>Investor Expression of Interest</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: B.s, fontFamily: FONT }}>
          Register your interest to receive deal flow and allocation opportunities.
        </p>
      </div>
      <SheetField label="Your Name"   value={name}  onChange={setName}  />
      <SheetField label="Work Email"  value={email} onChange={setEmail} />
      <SheetField label="Firm"        value={firm}  onChange={setFirm}  />
      <FSelect label="Investor Type"  value={type}  options={investorTypes} onChange={setType} />
      <FSelect label="Target Allocation Size" value={size} options={sizeBands} onChange={setSize} />
      <SubmitBtn label="Submit EOI" color={B.gr} onClick={onClose} />
    </ModalOverlay>
  );
}

function PartnerEOIModal({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [firm, setFirm]   = useState('');
  const [role, setRole]   = useState('');

  const roles = ['Servicer', 'Originator', 'Structurer', 'Legal Counsel', 'Rating Agency', 'Other'];

  return (
    <ModalOverlay onClose={onClose}>
      <div>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: B.p, fontFamily: FONT }}>Partner Expression of Interest</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: B.s, fontFamily: FONT }}>
          Explore co-structuring, advisory, or distribution partnership opportunities.
        </p>
      </div>
      <SheetField label="Your Name"  value={name}  onChange={setName}  />
      <SheetField label="Work Email" value={email} onChange={setEmail} />
      <SheetField label="Firm"       value={firm}  onChange={setFirm}  />
      <FSelect label="Partnership Role" value={role} options={roles} onChange={setRole} />
      <SubmitBtn label="Submit EOI" color={B.pu} onClick={onClose} />
    </ModalOverlay>
  );
}

// ─── WizardShell ──────────────────────────────────────────────────────────────

function WizardShell({ children, onBack, title, subtitle }: {
  children:  React.ReactNode;
  onBack:    () => void;
  title:     string;
  subtitle:  string;
}) {
  return (
    <div style={{ minHeight: '100vh', background: B.bg, display: 'flex', flexDirection: 'column',
      fontFamily: FONT }}>
      <div style={{ height: 80 }} />
      <div style={{ flex: 1, padding: '40px 40px 80px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {onBack && (
          <button onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: B.s,
              fontSize: 14, fontFamily: FONT, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back
          </button>
        )}
        {title && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: B.p }}>{title}</h2>
            {subtitle && <p style={{ margin: '8px 0 0', fontSize: 15, color: B.s }}>{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Small UI helpers ─────────────────────────────────────────────────────────

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: B.p, fontFamily: FONT,
      letterSpacing: '-0.01em' }}>{children}</h3>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 30, fontWeight: 700, color, fontFamily: MONO }}>{value}</span>
      <span style={{ fontSize: 12, color: B.s, fontFamily: FONT, textTransform: 'uppercase',
        letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}

function ActionBtn({ label, color, onClick, outline }: {
  label: string; color: string; onClick: () => void; outline?: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{ padding: '10px 18px', borderRadius: 8, fontFamily: FONT, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
        ...(outline
          ? { border: `1.5px solid ${color}`, background: 'transparent', color }
          : { border: 'none', background: color, color: '#fff' }) }}>
      {label}
    </button>
  );
}

// ─── FitScoreView (root export) ───────────────────────────────────────────────

export default function FitScoreView({ onSelectItem }: { onSelectItem: (v: string | null) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  const [step,     setStep]     = useState<Step>('landing');
  const [persona,  setPersona]  = useState<Persona>('bank');
  const [_mode,    setMode]     = useState<Mode>('assess');
  const [form,     setForm]     = useState<SuitForm>({ institution: '', jurisdiction: '', assets: '', capital: '', portfolio: '', portfolioSize: '', goal: '', quality: '', explored: '' });
  const [score,    setScore]    = useState(0);

  const [showQuote,    setShowQuote]    = useState(false);
  const [showInvestor, setShowInvestor] = useState(false);
  const [showPartner,  setShowPartner]  = useState(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setIsCompact(entry.contentRect.width < 1080));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleInstSelect = useCallback((inst: Institution) => {
    setForm(f => ({ ...f, institution: inst.type, jurisdiction: inst.jurisdiction, assets: inst.assets }));
    setStep('form');
  }, []);

  const handleSubmit = useCallback(() => {
    setScore(computeScore(form));
    setStep('loading');
  }, [form]);

  const handleLoadDone = useCallback(() => setStep('results'), []);

  const handleDemo = useCallback(() => {
    setForm(EXAMPLE_FORM);
  }, []);

  const handleRestart = useCallback(() => {
    setStep('landing');
    setForm({ institution: '', jurisdiction: '', assets: '', capital: '', portfolio: '', portfolioSize: '', goal: '', quality: '', explored: '' });
    setScore(0);
  }, []);

  const backFromStep: Record<Step, Step> = {
    landing: 'landing', persona: 'landing', mode: 'persona',
    institutionSearch: 'mode', form: 'institutionSearch',
    loading: 'form', results: 'landing',
  };

  const isWizard = step !== 'landing';

  return (
    <div ref={outerRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={scrollRef} style={{ width: '100%', height: '100%', overflowY: 'auto' }}>

        <HeaderNav isCompact={isCompact} scrollRef={scrollRef}
          selectedItem="FitScore" onSelectItem={onSelectItem} />

        {/* ── Landing ── */}
        {step === 'landing' && (
          <>
            <SuitLanding onStart={() => setStep('persona')} />
            <PageFooter isCompact={isCompact} />
          </>
        )}

        {/* ── Wizard steps ── */}
        {isWizard && (
          <div style={{ background: B.bg }}>
            {/* Step bar (non-loading/non-landing) */}
            {step !== 'loading' && (
              <div style={{ position: 'sticky', top: 80, zIndex: 10, background: B.card,
                borderBottom: `1px solid ${B.bd}`, padding: '16px 40px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                  <StepBar current={step} />
                </div>
              </div>
            )}

            {step === 'persona' && (
              <SuitPersona onSelect={p => { setPersona(p); setStep('mode'); }}
                onBack={() => setStep(backFromStep['persona'])} />
            )}

            {step === 'mode' && (
              <SuitMode persona={persona} onSelect={m => { setMode(m); setStep(m === 'explore' ? 'form' : 'institutionSearch'); }}
                onBack={() => setStep(backFromStep['mode'])} />
            )}

            {step === 'institutionSearch' && (
              <SuitInstitutionSearch
                onSelect={handleInstSelect}
                onSkip={() => setStep('form')}
                onBack={() => setStep(backFromStep['institutionSearch'])} />
            )}

            {step === 'form' && (
              <SuitFormScreen form={form} onChange={setForm}
                onSubmit={handleSubmit} onDemo={handleDemo}
                onBack={() => setStep(backFromStep['form'])} />
            )}

            {step === 'loading' && <SuitLoading onDone={handleLoadDone} />}

            {step === 'results' && (
              <SuitResults form={form} score={score} persona={persona}
                onRestart={handleRestart}
                onQuote={() => setShowQuote(true)}
                onInvestorEOI={() => setShowInvestor(true)}
                onPartnerEOI={() => setShowPartner(true)} />
            )}
          </div>
        )}

      </div>

      {/* Modal sheets */}
      {showQuote    && <BankQuoteModal    onClose={() => setShowQuote(false)} />}
      {showInvestor && <InvestorEOIModal  onClose={() => setShowInvestor(false)} />}
      {showPartner  && <PartnerEOIModal   onClose={() => setShowPartner(false)} />}
    </div>
  );
}
