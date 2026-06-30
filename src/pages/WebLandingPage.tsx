// src/pages/WebLandingPage.tsx
// Converted from WebLandingPage.swift (Gensaki SRT platform)
// Stack: React + TypeScript + Tailwind CSS + Vite

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import { CTAButton, HeroEyebrow, HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

// ─── Palette ──────────────────────────────────────────────────────────────────
// Mirrors the fileprivate Swift tokens exactly.

const C = {
  bg:        '#FBFBF8',
  ink:       '#0E1410',
  ink2:      '#2A312D',
  mute:      '#6B7368',
  mute2:     '#9AA29A',
  line:      '#E6E8E2',
  line2:     '#EFF1EB',
  card:      '#F4F5F0',
  card2:     '#EDEFE9',
  cyan:      '#74E0FF',
  cyanInk:   '#0B1D27',
  green:     '#2F9E69',
  navy:      '#0B1320',
  navyText:  '#E6EBF2',
  navyMute:  '#9DA8B8',
  mint1:     '#E7F6EC',
  mint2:     '#F1FBF3',
  // Wong colorblind-safe dashboard accents
  bl:        'rgb(0,114,178)',
  am:        'rgb(230,159,0)',
  rd:        'rgb(213,94,0)',
  pu:        'rgb(120,92,196)',
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

type FontFamily = 'geist' | 'mono';

function ff(family: FontFamily): string {
  return family === 'geist'
    ? '"Geist", system-ui, sans-serif'
    : '"JetBrains Mono", "Courier New", monospace';
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return reduce;
}

// ─── Marquee ─────────────────────────────────────────────────────────────────
// rAF-driven horizontal ticker. Matches the Swift Marquee component.

interface MarqueeProps {
  speed?: number;   // px/s, default 36
  spacing?: number; // px gap after each copy
  height?: number;
  children: React.ReactNode;
}

export function Marquee({ speed = 36, spacing = 64, height = 36, children }: MarqueeProps) {
  const reduceMotion = useReduceMotion();
  const trackRef     = useRef<HTMLDivElement>(null);
  const unitRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const offsetRef    = useRef(0);
  const [unitW, setUnitW]      = useState(0);
  const [containerW, setContW] = useState(0);

  useEffect(() => {
    if (!unitRef.current) return;
    const ro = new ResizeObserver(([e]) => setUnitW(e.contentRect.width));
    ro.observe(unitRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = trackRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setContW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || unitW === 0) return;
    let last: number | null = null;
    const tick = (t: number) => {
      if (last !== null) {
        offsetRef.current = (offsetRef.current + speed * (t - last) / 1000) % unitW;
        if (trackRef.current)
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      last = t;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduceMotion, unitW, speed]);

  const copies = unitW > 0 ? Math.ceil(containerW / unitW) + 2 : 3;

  return (
    <div style={{ height, overflow: 'hidden' }}>
      <div ref={trackRef} style={{ display: 'flex', willChange: 'transform' }}>
        {Array.from({ length: Math.max(copies, 2) }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? unitRef : undefined}
            style={{ paddingRight: spacing, flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Centered container ───────────────────────────────────────────────────────

function Centered({
  children, hPad = 40, maxWidth = 1320,
}: {
  children: React.ReactNode; hPad?: number; maxWidth?: number;
}) {
  return (
    <div style={{ padding: `0 ${hPad}px` }}>
      <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

// ─── DashedLine ───────────────────────────────────────────────────────────────

function DashedLine({ color = C.line }: { color?: string }) {
  return (
    <div style={{
      width: '100%', height: 1,
      backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 3px, transparent 3px, transparent 7px)`,
    }} />
  );
}

// ─── SectionEyebrow ──────────────────────────────────────────────────────────

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: C.cyan, display: 'block', flexShrink: 0 }} />
      <span style={{ fontFamily: ff('mono'), fontSize: 11.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase' }}>
        {text}
      </span>
    </div>
  );
}

// ─── SectionHead ─────────────────────────────────────────────────────────────

export interface TitleSpan { text: string; em: boolean; }

function TitleText({ spans, size }: { spans: TitleSpan[]; size: number }) {
  return (
    <p style={{
      fontFamily: ff('geist'), fontSize: size, fontWeight: 500,
      letterSpacing: size > 40 ? '-1.7px' : '-1.1px',
      lineHeight: 1, maxWidth: 760, margin: 0,
    }}>
      {spans.map((s, i) => (
        <span key={i} style={{ color: s.em ? C.mute : C.ink, fontWeight: s.em ? 400 : 500 }}>
          {s.text}
        </span>
      ))}
    </p>
  );
}

function SectionHead({ eyebrow, title, aside, isCompact }: {
  eyebrow: string; title: TitleSpan[]; aside: string; isCompact: boolean;
}) {
  const asideEl = (
    <p style={{
      fontFamily: ff('geist'), fontSize: isCompact ? 15 : 17.5,
      fontWeight: 400, color: C.mute, lineHeight: 1.6, margin: 0,
    }}>
      {aside}
    </p>
  );

  if (isCompact) {
    return (
      <div style={{ paddingBottom: 40 }}>
        <SectionEyebrow text={eyebrow} />
        <div style={{ marginTop: 18, marginBottom: 22 }}>
          <TitleText spans={title} size={38} />
        </div>
        {asideEl}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 56 }}>
      <div style={{ flex: '0 1 auto' }}>
        <SectionEyebrow text={eyebrow} />
        <div style={{ marginTop: 18 }}>
          <TitleText spans={title} size={56} />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }} />
      <div style={{ width: 1, alignSelf: 'stretch', background: C.line, flexShrink: 0 }} />
      <div style={{ maxWidth: 340, flexShrink: 0 }}>{asideEl}</div>
      <div style={{ flex: 1 }} />
    </div>
  );
}

// ─── TagChip ─────────────────────────────────────────────────────────────────

function TagChip({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <span style={{
      fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.2px',
      color: onDark ? '#A8B4C4' : C.ink2,
      padding: '4px 8px',
      background: onDark ? 'rgba(255,255,255,0.06)' : C.card2,
      borderRadius: 5,
    }}>
      {text}
    </span>
  );
}

function FlowTags({ tags, onDark = false }: { tags: string[]; onDark?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((t, i) => <TagChip key={i} text={t} onDark={onDark} />)}
    </div>
  );
}

// ─── HairlineGrid ─────────────────────────────────────────────────────────────

function HairlineGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: C.line,
      borderRadius: 20,
      border: `1px solid ${C.line}`,
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── Hero diagram ─────────────────────────────────────────────────────────────

function DiagramPill({ label, meta, glow = false }: { label: string; meta: string; glow?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 18px',
      background: glow ? C.cyan : C.card,
      border: glow ? 'none' : `1px solid ${C.line}`,
      borderRadius: 8,
      boxShadow: glow ? `0 6px 18px ${C.cyan}59` : 'none',
    }}>
      <span style={{ fontFamily: ff('mono'), fontSize: 12, letterSpacing: '0.7px', color: glow ? C.cyanInk : C.ink2, flex: 1 }}>
        {label}
      </span>
      <span style={{ fontFamily: ff('mono'), fontSize: 10, color: glow ? `${C.cyanInk}99` : C.mute2 }}>
        {meta}
      </span>
    </div>
  );
}

function EngineCard() {
  return (
    <div style={{
      padding: 18, width: 200,
      background: '#fff', borderRadius: 18, border: `1px solid ${C.line}`,
      boxShadow: `0 22px 40px ${C.navy}29`,
    }}>
      <div style={{
        fontFamily: ff('geist'), fontSize: 14, fontWeight: 500,
        letterSpacing: '-0.2px', color: C.ink, textAlign: 'center', marginBottom: 12,
      }}>
        Gensaki Engine
      </div>
      <div style={{ fontFamily: ff('mono'), fontSize: 10.5 }}>
        <div style={{ display: 'flex' }}>
          <span style={{ color: C.mute, flex: 1 }}>CET1 Δ</span>
          <span style={{ fontWeight: 500, color: C.green }}>+182 bps</span>
        </div>
        <div style={{ height: 1, background: C.line, margin: '9px 0' }} />
        <div style={{ display: 'flex' }}>
          <span style={{ color: C.mute, flex: 1 }}>Loss buffer</span>
          <span style={{ fontWeight: 500, color: C.ink }}>5.4%</span>
        </div>
      </div>
    </div>
  );
}

// Animated SVG bezier connectors — approximation of the Canvas draw() calls.
function HeroConnectors() {
  const reduceMotion = useReduceMotion();
  const yPcts = [13, 50, 87];

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        overflow: 'visible', pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id="hcFlowL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.cyan}  stopOpacity="0" />
          <stop offset="100%" stopColor={C.cyan}  stopOpacity="1" />
        </linearGradient>
        <linearGradient id="hcFlowR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={C.green} stopOpacity="1" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0" />
        </linearGradient>
      </defs>

      {yPcts.map(yp => (
        <g key={yp}>
          <path d={`M 17.5%,${yp}% C 30%,${yp}% 36%,50% 38%,50%`}
                fill="none" stroke="#CDD1C6" strokeWidth="1" strokeDasharray="3 5" />
          <path d={`M 62%,50% C 64%,50% 70%,${yp}% 82.5%,${yp}%`}
                fill="none" stroke="#CDD1C6" strokeWidth="1" strokeDasharray="3 5" />
        </g>
      ))}

      {!reduceMotion && (
        <>
          <path d="M 17.5%,13% C 30%,13% 36%,50% 38%,50%"
                fill="none" stroke="url(#hcFlowL)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9">
            <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.2s" repeatCount="indefinite" />
          </path>
          <path d="M 62%,50% C 64%,50% 70%,13% 82.5%,13%"
                fill="none" stroke="url(#hcFlowR)" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 9">
            <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="1.2s" repeatCount="indefinite" />
          </path>
        </>
      )}
    </svg>
  );
}

const LEFT_PILLS:  Array<[string, string, boolean]> = [['HELOC','$2.4B',true],['AUTO','$1.1B',false],['CRE','$3.8B',false]];
const RIGHT_PILLS: Array<[string, string, boolean]> = [['PRIVATE CREDIT','8 desks',true],['REINSURANCE','12 desks',false],['HEDGE FUND','5 desks',false]];

export function HeroDiagram({ isCompact }: { isCompact: boolean }) {
  if (isCompact) {
    return (
      <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '32px 0' }}>
        <p style={{ fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase', marginBottom: 10 }}>
          {'// Bank balance sheet'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {LEFT_PILLS.map(([l, m, g], i) => <DiagramPill key={i} label={l} meta={m} glow={g} />)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><EngineCard /></div>
        <p style={{ fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase', marginBottom: 10 }}>
          {'Credit protection providers //'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RIGHT_PILLS.map(([l, m, g], i) => <DiagramPill key={i} label={l} meta={m} glow={g} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase' }}>
          {'// Bank balance sheet'}
        </span>
        <span style={{ fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.8px', color: C.mute, textTransform: 'uppercase' }}>
          {'Credit protection providers //'}
        </span>
      </div>
      <div style={{ position: 'relative', height: 360 }}>
        <HeroConnectors />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 220, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {LEFT_PILLS.map(([l, m, g], i) => <DiagramPill key={i} label={l} meta={m} glow={g} />)}
          </div>
          <div style={{ width: 220, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {RIGHT_PILLS.map(([l, m, g], i) => <DiagramPill key={i} label={l} meta={m} glow={g} />)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          <EngineCard />
        </div>
      </div>
    </div>
  );
}

// ─── TopWashSection ───────────────────────────────────────────────────────────

function TopWashSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 40,
      background: [
        `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%)`,
        `radial-gradient(ellipse at 50% -20%, ${C.mint1}, ${C.mint2}, transparent 60%)`,
      ].join(', '),
    }}>
      {/* Reserve space below the fixed transparent nav */}
      <div style={{ height: 80, flexShrink: 0 }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: `0 ${hPad}px` }}>
        <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', flex: 1 }}>

            <div style={{ paddingTop: isCompact ? 36 : 60, marginBottom: 32 }}>
              <HeroEyebrow text="SRT pilots open for Q4 2026, limited capacity" />
            </div>

            <div style={{ marginBottom: 28 }}>
              <span style={{
                fontFamily: ff('geist'),
                fontSize: isCompact ? 46 : 88,
                fontWeight: 500,
                letterSpacing: isCompact ? '-1.6px' : '-3px',
                lineHeight: 1.05,
                color: C.ink,
              }}>
                Bank & Credit Union<br />Capital Relief,{' '}
              </span>
              <span style={{
                fontFamily: ff('geist'),
                fontSize: isCompact ? 46 : 88,
                fontWeight: 400,
                letterSpacing: isCompact ? '-1.6px' : '-3px',
                lineHeight: 1.05,
                color: C.mute,
              }}>
                On Demand.
              </span>
            </div>

            <div style={{ marginBottom: 40 }}>
              {[
                '// A turnkey Significant Risk Transfer execution platform.',
                '// Unlock CET1, keep the loans, grow the book, without',
                '// building an internal CRT desk.',
              ].map((line, i) => (
                <div key={i} style={{ fontFamily: ff('mono'), fontSize: isCompact ? 13 : 15, color: C.ink2, lineHeight: 1.7 }}>
                  {line}
                </div>
              ))}
            </div>

            {/* Spacer — pushes CTAs to bottom of section */}
            <div style={{ flex: 1 }} />

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <CTAButton title="Request Free Demo" kind="ink" />
              <CTAButton title="Talk to the team" kind="ghost" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StatsBandSection ─────────────────────────────────────────────────────────

interface StatData { num: string; unit: string; label: string; sub: string; }

const STATS: StatData[] = [
  { num: '182', unit: 'bps',  label: 'Avg. CET1 relief',  sub: 'Across pilot HELOC and CRE portfolios, calibrated to Basel III endgame.' },
  { num: '38',  unit: 'days', label: 'Mandate to close',  sub: 'From portfolio selection to signed CLN, versus 6 to 9 months in-house.' },
  { num: '$7.4',unit: 'B',    label: 'Pipeline assessed',  sub: 'Reference pool nominal evaluated through the Gensaki structuring engine.' },
  { num: '25',  unit: '+',    label: 'Vetted investors',   sub: 'Private credit, reinsurance, and hedge fund counterparties wired to the panel.' },
];

function StatTile({ s }: { s: StatData }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
        <span style={{ fontFamily: ff('geist'), fontSize: 56, fontWeight: 500, letterSpacing: '-2.2px', fontVariantNumeric: 'tabular-nums' }}>
          {s.num}
        </span>
        <span style={{ fontFamily: ff('geist'), fontSize: 24, fontWeight: 400, color: C.mute }}>{s.unit}</span>
      </div>
      <div style={{ fontFamily: ff('mono'), fontSize: 11.5, letterSpacing: '0.7px', color: C.mute, textTransform: 'uppercase', marginBottom: 6 }}>
        {s.label}
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 400, color: C.mute, lineHeight: 1.6, paddingTop: 6 }}>
        {s.sub}
      </div>
    </div>
  );
}

export function StatsBandSection({ isCompact }: { isCompact: boolean }) {
  return (
    <div style={{
      background: '#fff',
      borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`,
      marginTop: isCompact ? 80 : 120,
    }}>
      <Centered hPad={isCompact ? 20 : 40}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${isCompact ? 2 : 4}, 1fr)`,
          gap: isCompact ? 32 : 48,
          padding: `${isCompact ? 48 : 64}px 0`,
        }}>
          {STATS.map((s, i) => <StatTile key={i} s={s} />)}
        </div>
      </Centered>
    </div>
  );
}

// ─── ProductsSection ─────────────────────────────────────────────────────────

interface ProductData {
  index: string; icon: string; title: string; body: string;
  tags: string[]; feature?: boolean;
}

// TODO: replace glyph map with lucide-react icons matched to Swift SF Symbol names
const ICON_GLYPHS: Record<string, string> = {
  'sliders': '⚙', 'file-text': '📄', 'users': '👥',
  'refresh-cw': '↺', 'shield-check': '✓', 'bar-chart-2': '▦',
};

const PRODUCTS: ProductData[] = [
  {
    index: '01 / Core', icon: 'sliders', title: 'Structuring Engine',
    body: 'Pick portfolios, structure tranches, and calibrate attachment points with live RWA projections. Every change updates CET1, loss buffer, and SRT metrics in real time so deals line up with prudential rules before you ever pitch them.',
    tags: ['CET1 sim', 'Attachment calc', 'RWA delta', 'Tranche builder', 'Basel III endgame'],
    feature: true,
  },
  {
    index: '02', icon: 'file-text', title: 'Documentation Rails',
    body: 'Supervisor-aligned templates for ISDA, CLN term sheets, SPV documents, and investor materials, meeting definitional, operational, and legal certainty requirements.',
    tags: ['ISDA', 'CLN', 'SPV'],
  },
  {
    index: '03', icon: 'users', title: 'Investor Matching',
    body: 'A vetted panel of private credit and asset managers who understand SRTs, meet regulatory constraints, and commit funded mezzanine protection via CLN or CDS.',
    tags: ['Private credit', 'Reinsurance', 'Funded mezz'],
  },
  {
    index: '04', icon: 'refresh-cw', title: 'Lifecycle Automation',
    body: 'From closing to maturity: investor reporting, credit events, reconciliations, and regulatory updates, a continuous audit trail of coverage and capital.',
    tags: ['Reporting', 'Credit events', 'Audit trail'],
  },
  {
    index: '05', icon: 'shield-check', title: 'SRT Recognition Checks',
    body: 'Supervisory tests embedded, every deal auto-checked on capital relief, structure, loss coverage, and formula risk weights before execution.',
    tags: ['Auto-tests', 'Recognition pack', 'Regulator-ready'],
  },
  {
    index: '06', icon: 'bar-chart-2', title: 'Oversight and Capital Tracking',
    body: 'Maps impact on first loss, mezzanine, and senior tranches. Applies risk weights. Shows CET1 draw, relief, and effective loss buffer before and after each trade.',
    tags: ['First loss', 'Mezz', 'Senior', 'CET1 live'],
  },
];

function ProductCard({ item }: { item: ProductData }) {
  const [h, setH] = useState(false);
  const feat = !!item.feature;

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        padding: '32px 28px',
        background: feat ? C.navy : '#fff',
        transition: 'all 0.15s ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: ff('mono'), fontSize: 11, letterSpacing: '0.7px', color: feat ? C.cyan : C.mute2 }}>
          {item.index}
        </span>
        <span style={{ color: feat ? C.cyan : C.mute2, opacity: h ? 1 : 0, transition: 'opacity 0.15s', fontFamily: ff('geist'), fontSize: 13 }}>
          ↗
        </span>
      </div>

      <div style={{
        width: 44, height: 44, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        color: feat ? C.cyan : C.ink,
        background: feat ? 'rgba(255,255,255,0.06)' : C.card,
        border: `1px solid ${feat ? 'rgba(255,255,255,0.08)' : (h ? C.cyan : C.line)}`,
        borderRadius: 10, transition: 'border-color 0.15s',
      }}>
        {ICON_GLYPHS[item.icon] ?? '◆'}
      </div>

      <div style={{ fontFamily: ff('geist'), fontSize: feat ? 28 : 22, fontWeight: 500, letterSpacing: '-0.5px', color: feat ? '#fff' : C.ink, marginBottom: 12 }}>
        {item.title}
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: feat ? 15 : 14, fontWeight: 400, color: feat ? C.navyMute : C.mute, lineHeight: 1.6, flex: 1, maxWidth: feat ? 430 : undefined }}>
        {item.body}
      </div>

      <div style={{ marginTop: 12, paddingTop: 20 }}>
        <DashedLine color={feat ? 'rgba(255,255,255,0.1)' : C.line} />
        <div style={{ marginTop: 20 }}>
          <FlowTags tags={item.tags} onDark={feat} />
        </div>
      </div>
    </div>
  );
}

function ProductsSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  return (
    <div style={{ paddingTop: isCompact ? 80 : 120, paddingBottom: isCompact ? 80 : 120 }}>
      <Centered hPad={hPad}>
        <SectionHead
          eyebrow="Products"
          title={[{ text: 'A turnkey SRT platform for ', em: false }, { text: 'banks and credit unions.', em: true }]}
          aside="Gensaki makes synthetic risk transfers accessible, compliant, and execution-ready for institutions without an internal CRT desk, from structuring through lifecycle."
          isCompact={isCompact}
        />
        <HairlineGrid>
          {isCompact ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {PRODUCTS.map((p, i) => <ProductCard key={i} item={p} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', gap: 1 }}>
                <div style={{ flex: 1, display: 'flex' }}><ProductCard item={PRODUCTS[0]} /></div>
                <div style={{ flex: 1, display: 'flex', gap: 1 }}>
                  <ProductCard item={PRODUCTS[1]} />
                  <ProductCard item={PRODUCTS[2]} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 1 }}>
                {PRODUCTS.slice(3).map((p, i) => <ProductCard key={i} item={p} />)}
              </div>
            </div>
          )}
        </HairlineGrid>
      </Centered>
    </div>
  );
}

// ─── WorkflowSection ─────────────────────────────────────────────────────────

interface StepData { num: string; time: string; title: string; body: string; active?: boolean; }

const STEPS: StepData[] = [
  { num: '01', time: 'Days 1 to 4',   title: 'Select reference pool',
    body: 'Upload loan tape, slice by vintage, geography, FICO band. Engine flags eligibility against synthetic securitization rules.' },
  { num: '02', time: 'Days 5 to 14',  title: 'Structure and calibrate',
    body: 'Tranche thickness, attachment points, premium leg, modeled live with CET1 and effective loss-buffer projections.', active: true },
  { num: '03', time: 'Days 12 to 22', title: 'Match investors',
    body: 'Auto-route to the vetted panel. Negotiate terms, run KYC, share data rooms, all in one workflow.' },
  { num: '04', time: 'Days 22 to 32', title: 'Recognition tests',
    body: 'Run SRT tests, generate the supervisor pack, capture sign-offs with full audit trail before pricing.' },
  { num: '05', time: 'Days 32 to 38', title: 'Execute and manage',
    body: 'Sign CLN/CDS, settle, then hand off to lifecycle automation: events, reconciliations, RWA refresh.' },
];

function WorkflowStep({ step }: { step: StepData }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: ff('mono'), fontSize: 13, fontWeight: 500,
        color: step.active ? C.cyanInk : C.ink,
        background: step.active ? C.cyan : '#fff',
        border: step.active ? 'none' : `1px solid ${C.line}`,
        boxShadow: step.active ? `0 0 10px ${C.cyan}4D` : 'none',
      }}>
        {step.num}
      </div>
      <div style={{ fontFamily: ff('mono'), fontSize: 10.5, letterSpacing: '0.6px', color: C.mute2, textTransform: 'uppercase', marginTop: 4 }}>
        {step.time}
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px', color: C.ink }}>
        {step.title}
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 13, fontWeight: 400, color: C.mute, lineHeight: 1.6 }}>
        {step.body}
      </div>
    </div>
  );
}

function WorkflowSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  return (
    <div style={{ paddingTop: isCompact ? 80 : 120 }}>
      <Centered hPad={hPad}>
        <SectionHead
          eyebrow="How it works"
          title={[{ text: 'From portfolio to close in ', em: false }, { text: '38 days', em: true }, { text: ', not nine months.', em: false }]}
          aside="Five stages. One platform. Each step produces a regulator-ready artifact you can hand to risk, audit, or the supervisor on demand."
          isCompact={isCompact}
        />
        <div style={{ padding: 40, background: '#fff', borderRadius: 20, border: `1px solid ${C.line}` }}>
          {isCompact ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {STEPS.map((s, i) => <WorkflowStep key={i} step={s} />)}
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 24, left: 24, right: 24 }}>
                <DashedLine />
              </div>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {STEPS.map((s, i) => <WorkflowStep key={i} step={s} />)}
              </div>
            </div>
          )}
        </div>
      </Centered>
    </div>
  );
}

// ─── WaterfallChart ───────────────────────────────────────────────────────────

type BarKind = 'base' | 'down' | 'up' | 'total';
interface BarData { label: string; value: string; height: number; kind: BarKind; }

const BARS: BarData[] = [
  { label: 'RWAs',       value: '$420M',    height: 0.62, kind: 'base' },
  { label: 'Mezz',       value: '−$180M',   height: 0.30, kind: 'down' },
  { label: 'First loss', value: '−$95M',    height: 0.18, kind: 'down' },
  { label: 'CET1 Δ',    value: '+182 bps', height: 0.46, kind: 'up' },
  { label: 'Loss buf.',  value: '5.4%',     height: 0.38, kind: 'up' },
  { label: 'Net relief', value: '$145M',    height: 0.78, kind: 'total' },
];

function barFill(k: BarKind) {
  return k === 'base' ? C.card : k === 'down' ? `${C.am}2E` : k === 'up' ? `${C.cyan}47` : C.navy;
}
function barBorder(k: BarKind) {
  return k === 'base' ? C.line : k === 'down' ? `${C.am}80` : k === 'up' ? `${C.cyan}8C` : C.navy;
}

function WaterfallChart() {
  const CHART_H = 148;
  return (
    <div style={{
      padding: '6px 24px 24px', height: 220,
      background: 'linear-gradient(to bottom,#FBFCF9,#fff)',
      borderRadius: 14, border: `1px dashed ${C.line}`,
      display: 'flex', alignItems: 'flex-end', gap: 14,
    }}>
      {BARS.map((bar, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', height: CHART_H, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{
              position: 'absolute',
              bottom: Math.max(8, CHART_H * bar.height) + 6,
              left: 0, right: 0, textAlign: 'center',
              fontFamily: ff('mono'), fontSize: 10.5, color: C.ink, whiteSpace: 'nowrap',
            }}>
              {bar.value}
            </div>
            <div style={{
              height: Math.max(8, CHART_H * bar.height),
              background: barFill(bar.kind),
              border: `1px solid ${barBorder(bar.kind)}`,
              borderRadius: 6,
            }} />
          </div>
          <div style={{ fontFamily: ff('mono'), fontSize: 8.4, letterSpacing: '0.4px', color: C.mute, textTransform: 'uppercase', textAlign: 'center' }}>
            {bar.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── NetworkDiagram ───────────────────────────────────────────────────────────

type NodeStyle = 'hub' | 'cyan' | 'plain';
interface NodeData { label: string; x: number; y: number; style: NodeStyle; }

const NODES: NodeData[] = [
  { label: 'GENSAKI',        x: 0.50, y: 0.50, style: 'hub' },
  { label: 'Private Credit', x: 0.13, y: 0.18, style: 'cyan' },
  { label: 'Reinsurer',      x: 0.84, y: 0.18, style: 'plain' },
  { label: 'Hedge Fund',     x: 0.11, y: 0.80, style: 'plain' },
  { label: 'PC Desk',        x: 0.86, y: 0.80, style: 'plain' },
  { label: 'Mezz Fund',      x: 0.24, y: 0.50, style: 'plain' },
  { label: 'CDS Desk',       x: 0.74, y: 0.50, style: 'plain' },
  { label: 'SPV',            x: 0.50, y: 0.12, style: 'plain' },
  { label: 'Insurer',        x: 0.50, y: 0.88, style: 'plain' },
];

function nodeFg(s: NodeStyle) { return s === 'hub' ? '#fff' : s === 'cyan' ? C.cyanInk : C.ink2; }
function nodeBg(s: NodeStyle) { return s === 'hub' ? C.navy : s === 'cyan' ? C.cyan : '#fff'; }

function NetworkDiagram() {
  const hub = NODES[0];
  return (
    <div style={{
      position: 'relative', height: 220,
      background: 'linear-gradient(to bottom,#FBFCF9,#fff)',
      borderRadius: 14, border: `1px dashed ${C.line}`,
    }}>
      <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {NODES.filter(n => n.style !== 'hub').map((n, i) => (
          <line key={i}
            x1={`${hub.x * 100}%`} y1={`${hub.y * 100}%`}
            x2={`${n.x * 100}%`}   y2={`${n.y * 100}%`}
            stroke="#CDD1C6" strokeWidth="1" strokeDasharray="2 4"
          />
        ))}
      </svg>
      {NODES.map((n, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${n.x * 100}%`, top: `${n.y * 100}%`,
          transform: 'translate(-50%,-50%)',
          fontFamily: ff('mono'), fontSize: 10.5,
          color: nodeFg(n.style), background: nodeBg(n.style),
          border: n.style === 'plain' ? `1px solid ${C.line}` : 'none',
          borderRadius: 6, padding: '5px 10px', whiteSpace: 'nowrap', zIndex: 1,
        }}>
          {n.label}
        </div>
      ))}
    </div>
  );
}

// ─── SolutionsSection ─────────────────────────────────────────────────────────

function DeepLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: 2, background: C.cyan, display: 'block', flexShrink: 0 }} />
      <span style={{ fontFamily: ff('mono'), fontSize: 11.5, letterSpacing: '0.7px', color: C.mute, textTransform: 'uppercase' }}>
        {text}
      </span>
    </div>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ color: C.green, fontWeight: 700, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✓</span>
      <span style={{ fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 400, color: C.ink2, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

const RECOGNITION_ROWS: Array<[string, string, boolean]> = [
  ['Reference pool',     'HELOC_2026Q3.A',         false],
  ['Tranche structure',  '0–2.5 / 2.5–6 / 6–100', false],
  ['Mezz attachment',    '2.50%',                   false],
  ['Effective LB',       '5.40% ✓',                 true],
  ['SRT test (CRR 245)', 'Pass ✓',                  true],
  ['Risk weight floor',  '15% ✓',                   true],
  ['Pack hash',          '3f9a…b1c4',               false],
];

function RecognitionPackCard() {
  return (
    <div style={{ padding: 20, background: '#fff', borderRadius: 14, border: `1px solid ${C.line}`, boxShadow: `0 18px 40px ${C.navy}1A` }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: ff('geist'), fontSize: 15, fontWeight: 500, letterSpacing: '-0.2px', color: C.ink, flex: 1 }}>
          Recognition Pack
        </span>
        <span style={{
          fontFamily: ff('mono'), fontSize: 10, letterSpacing: '0.4px',
          color: C.green, textTransform: 'uppercase',
          padding: '3px 8px', background: `${C.green}1A`,
          border: `1px solid ${C.green}40`, borderRadius: 5,
        }}>
          ● Ready
        </span>
      </div>
      {RECOGNITION_ROWS.map(([k, v, isGreen], i) => (
        <div key={i}>
          <div style={{ display: 'flex', padding: '10px 0' }}>
            <span style={{ fontFamily: ff('mono'), fontSize: 11.5, color: C.mute, flex: 1 }}>{k}</span>
            <span style={{ fontFamily: ff('mono'), fontSize: 11.5, color: isGreen ? C.green : C.ink }}>{v}</span>
          </div>
          {i < RECOGNITION_ROWS.length - 1 && <DashedLine />}
        </div>
      ))}
    </div>
  );
}

const COMPLIANCE_CHECKS = [
  'ISDA and CSA templates', 'SPV setup and trustee package',
  'Significant-risk-transfer tests', 'Investor reporting cadence',
  'SOC 2 Type II and data residency', 'Continuous audit trail (immutable)',
];

function ComplianceLeft({ isCompact }: { isCompact: boolean }) {
  return (
    <>
      <div style={{ marginBottom: 18 }}><SectionEyebrow text="Documentation and recognition" /></div>
      <div style={{ fontFamily: ff('geist'), fontSize: isCompact ? 30 : 40, fontWeight: 500, letterSpacing: '-1.1px', color: C.ink, marginBottom: 18 }}>
        Every deal closes with a regulator-ready pack.
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 15, fontWeight: 400, color: C.mute, lineHeight: 1.6, maxWidth: 520, marginBottom: 28 }}>
        Supervisor-aligned templates and embedded SRT tests mean nothing leaves the platform without passing capital relief, structure, loss coverage, and risk-weight checks.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : '1fr 1fr', gap: 14 }}>
        {COMPLIANCE_CHECKS.map((c, i) => <CheckRow key={i} text={c} />)}
      </div>
    </>
  );
}

function SolutionsSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  const p    = isCompact ? 28 : 48;

  const analyticsCard = (
    <div style={{ padding: p, background: '#fff', flex: 1 }}>
      <DeepLabel text="SRT Analytics and Capital Oversight" />
      <div style={{ fontFamily: ff('geist'), fontSize: isCompact ? 26 : 34, fontWeight: 500, letterSpacing: '-0.9px', color: C.ink, marginBottom: 16 }}>
        See CET1, loss buffer, and tranche cash flow move, live, in one view.
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 15, fontWeight: 400, color: C.mute, lineHeight: 1.6, maxWidth: 480, marginBottom: 32 }}>
        Gensaki tracks first loss, mezzanine, and senior exposures, credit events, protection cash flows, and capital ratios over time. The transparency risk, finance, auditors, and investors expect.
      </div>
      <WaterfallChart />
    </div>
  );

  const networkCard = (
    <div style={{ padding: p, background: '#fff', flex: 1 }}>
      <DeepLabel text="Vetted Credit Protection Network" />
      <div style={{ fontFamily: ff('geist'), fontSize: isCompact ? 26 : 34, fontWeight: 500, letterSpacing: '-0.9px', color: C.ink, marginBottom: 16 }}>
        One-click access to private credit, reinsurers, and hedge funds.
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 15, fontWeight: 400, color: C.mute, lineHeight: 1.6, maxWidth: 480, marginBottom: 32 }}>
        A curated network of specialist investors who understand SRTs and commit funded mezzanine protection across CRE, SME, mortgage, auto, and consumer pools.
      </div>
      <NetworkDiagram />
    </div>
  );

  return (
    <div style={{ paddingTop: isCompact ? 80 : 120, paddingBottom: isCompact ? 80 : 120 }}>
      <Centered hPad={hPad}>
        <SectionHead
          eyebrow="Solutions"
          title={[{ text: 'SRT analytics, oversight, and a ', em: false }, { text: 'vetted investor network', em: true }, { text: ', in one platform.', em: false }]}
          aside="One source of truth for risk, finance, treasury, and the supervisor. Built around the metrics regulators actually score."
          isCompact={isCompact}
        />
        <HairlineGrid>
          <div style={{ display: 'flex', flexDirection: isCompact ? 'column' : 'row', gap: 1 }}>
            {analyticsCard}
            {networkCard}
          </div>
        </HairlineGrid>

        <div style={{
          marginTop: 40, padding: p,
          background: 'linear-gradient(to bottom,#FBFCF9,#fff)',
          borderRadius: 20, border: `1px solid ${C.line}`,
        }}>
          {isCompact ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <ComplianceLeft isCompact={isCompact} />
              <RecognitionPackCard />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
              <div style={{ flex: 1 }}><ComplianceLeft isCompact={isCompact} /></div>
              <div style={{ flex: 1 }}><RecognitionPackCard /></div>
            </div>
          )}
        </div>
      </Centered>
    </div>
  );
}

// ─── WhoForSection ────────────────────────────────────────────────────────────

interface TierData { name: string; who: TitleSpan[]; bullets: string[]; anchor: string; highlighted?: boolean; }

const TIERS: TierData[] = [
  {
    name: '/ Banks and Credit Unions',
    who: [{ text: 'For institutions ', em: false }, { text: '$1B to $100B', em: true }, { text: ' in assets', em: false }],
    bullets: [
      'Auto, CRE, HELOC, SME, and mortgage reference pools',
      'Output aligned to Basel III endgame, CCAR, and NCUA',
      'Investor matching across 25+ vetted desks',
      'Full-service structuring with on-call advisory',
    ],
    anchor: '// Tier · Originator', highlighted: true,
  },
  {
    name: '/ Asset Managers and Insurers',
    who: [{ text: 'For ', em: false }, { text: 'investors', em: true }, { text: ' and protection providers', em: false }],
    bullets: [
      'Curated deal flow from vetted originators',
      'Standardized data room and KYC',
      'Live tranche performance dashboards',
      'Lifecycle reporting on every position',
    ],
    anchor: '// Tier · Investor',
  },
  {
    name: '/ Counsel, Ratings, and Agents',
    who: [{ text: 'For the ', em: false }, { text: 'ecosystem', em: true }, { text: ' around every trade', em: false }],
    bullets: [
      'Standardized ISDA, CSA, and SPV documentation rails',
      'Rating-ready data tapes and tranche cash flow models',
      'Trustee, paying, and calculation-agent workflows built in',
      'Immutable evidence trail for audit and SRT verification',
    ],
    anchor: '// Tier · Ecosystem',
  },
];

function TierCard({ tier }: { tier: TierData }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
         style={{ padding: 36, background: tier.highlighted ? C.card2 : '#fff', flex: 1, display: 'flex', flexDirection: 'column', transition: 'all 0.15s ease-out' }}>
      <div style={{ fontFamily: ff('mono'), fontSize: 11.5, letterSpacing: '0.7px', color: C.mute, textTransform: 'uppercase', marginBottom: 14 }}>
        {tier.name}
      </div>
      <div style={{ fontFamily: ff('geist'), fontSize: 22, fontWeight: 500, letterSpacing: '-0.5px', marginBottom: 16 }}>
        {tier.who.map((s, i) => <span key={i} style={{ color: s.em ? C.mute : C.ink, fontWeight: s.em ? 400 : 500 }}>{s.text}</span>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {tier.bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.ink, flexShrink: 0, marginTop: 7 }} />
            <span style={{ fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 400, color: C.ink2, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 24 }}>
        <DashedLine />
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
          <span style={{ fontFamily: ff('mono'), fontSize: 11, color: C.mute, flex: 1 }}>{tier.anchor}</span>
          <span style={{ fontFamily: ff('geist'), fontSize: 12, color: C.mute, opacity: h ? 1 : 0.55, transition: 'opacity 0.15s' }}>↗</span>
        </div>
      </div>
    </div>
  );
}

function WhoForSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  return (
    <div style={{ paddingTop: isCompact ? 80 : 120 }}>
      <Centered hPad={hPad}>
        <SectionHead
          eyebrow="Who it's for"
          title={[{ text: 'Built for institutions ', em: false }, { text: 'without a CRT desk.', em: true }]}
          aside="One platform, configured for every side of the trade. One view of risk, capital, and reporting, whether you originate it, take the other side, or close it."
          isCompact={isCompact}
        />
        <HairlineGrid>
          <div style={{ display: 'flex', flexDirection: isCompact ? 'column' : 'row', gap: 1 }}>
            {TIERS.map((t, i) => <TierCard key={i} tier={t} />)}
          </div>
        </HairlineGrid>
      </Centered>
    </div>
  );
}

// ─── BottomWashSection ────────────────────────────────────────────────────────

function BottomWashSection({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: isCompact ? 80 : 100,
      background: [
        `linear-gradient(to bottom,${C.bg},#F0F9F1 55%)`,
        `radial-gradient(ellipse at 50% 120%,${C.mint1},${C.mint2},transparent 540px)`,
      ].join(', '),
    }}>
      <Centered hPad={hPad}>
        <div style={{ textAlign: 'center', paddingBottom: isCompact ? 60 : 90 }}>
          <div style={{ fontFamily: ff('geist'), fontSize: isCompact ? 38 : 72, fontWeight: 500, letterSpacing: isCompact ? '-1.3px' : '-2.6px', lineHeight: 1, color: C.ink, marginBottom: 24 }}>
            Raise your capital efficiency,<br />without adding headcount.
          </div>
          <p style={{ fontFamily: ff('geist'), fontSize: 18, fontWeight: 400, color: C.ink2, lineHeight: 1.5, maxWidth: 640, margin: '0 auto 40px' }}>
            Early adopters are using Gensaki to run synthetic risk transfers with clarity, speed, and full transparency. Experience the new standard for capital optimization.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <CTAButton title="Request Free Demo" kind="ink" />
            <CTAButton title="Talk to the team" kind="ghost" />
          </div>
        </div>
      </Centered>

      {/* Flex spacer — distributes remaining viewport height between CTA and footer */}
      <div style={{ flex: 1 }} />

      <PageFooter isCompact={isCompact} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
// Always visible and interactive. At rest (scroll < 50 px) the background is
// fully transparent so the nav blends seamlessly with the hero gradient.
// Between 50–80 px the frosted-glass surface fades in; above 80 px it is fully
// opaque. The nav content itself never disappears.

// ─── SectionIndicator ─────────────────────────────────────────────────────────

function SectionIndicator({ count, active, onSelect }: {
  count: number; active: number; onSelect: (i: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 5px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Go to section ${i + 1}`}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6.5px 3px', width: 28,
          }}
        >
          <div style={{
            height: 3, borderRadius: 999,
            width: i === active ? 22 : 14,
            background: i === active ? C.cyan : C.bl,
            boxShadow: '0 0 2px rgba(0,0,0,0.22)',
            transition: 'width 0.25s ease-out, background 0.25s ease-out',
          }} />
        </button>
      ))}
    </div>
  );
}

// ─── WebLandingPage (root) ────────────────────────────────────────────────────

export interface WebLandingPageProps {
  selectedItem: string | null;
  onSelectItem: (v: string | null) => void;
}

export default function WebLandingPage({ selectedItem, onSelectItem }: WebLandingPageProps) {
  const SECTION_COUNT      = 6;
  const containerRef       = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const lastIdxRef         = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isCompact,   setIsCompact]   = useState(() => window.innerWidth < 1080);

  // Responsive breakpoint
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setIsCompact(e.contentRect.width < 1080));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Active section tracking via IntersectionObserver (≥50% visibility)
  useEffect(() => {
    const obs: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = new IntersectionObserver(entries => {
        if (entries[0].intersectionRatio >= 0.5) {
          setActiveIndex(prev => {
            if (i === prev) return prev;
            lastIdxRef.current = i;
            return i;
          });
        }
      }, { threshold: 0.5 });
      o.observe(el);
      obs.push(o);
    });
    return () => obs.forEach(o => o.disconnect());
  }, []);

  const scrollTo = useCallback((i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const sections = [
    <TopWashSection   isCompact={isCompact} />,
    <WhoForSection    isCompact={isCompact} />,
    <SolutionsSection isCompact={isCompact} />,
    <ProductsSection  isCompact={isCompact} />,
    <WorkflowSection  isCompact={isCompact} />,
    <BottomWashSection isCompact={isCompact} />,
  ];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100vh', background: C.bg, overflow: 'hidden' }}>

      {/* Paged outer scroll container */}
      <div ref={scrollContainerRef} style={{
        height: '100vh',
        overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
      }}>
        <style>{`.snap-hide-bar::-webkit-scrollbar { display: none; }`}</style>

        {sections.map((section, i) => (
          <div
            key={i}
            ref={el => { sectionRefs.current[i] = el; }}
            className="snap-hide-bar"
            style={{
              scrollSnapAlign: 'start',
              height: '100vh',
              overflowY: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {/* min-height lets dense sections scroll internally before snapping */}
            <div style={{ minHeight: '100vh' }}>{section}</div>
          </div>
        ))}
      </div>

      {/* Fixed header — transparent until 50 px scroll, fades in by 80 px */}
      <HeaderNav
        isCompact={isCompact}
        selectedItem={selectedItem}
        onSelectItem={onSelectItem}
        scrollRef={scrollContainerRef}
      />

      {/* Fixed left-side section indicator */}
      <div style={{
        position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50,
        opacity: 1, transition: 'opacity 0.3s',
      }}>
        <SectionIndicator count={SECTION_COUNT} active={activeIndex} onSelect={scrollTo} />
      </div>
    </div>
  );
}
