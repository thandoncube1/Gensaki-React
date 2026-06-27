// src/components/HeaderNav.tsx
// Shared navigation header used across all pages.
//
// Exports:
//   Wordmark       — logo mark + "Gensaki" wordmark, supports bigblack / bigwhite asset
//   NavLink        — underline-on-hover nav text button
//   CTAButton      — ink / cyan / ghost call-to-action button
//   GensakiNav     — full horizontal nav bar (wordmark + links + CTA)
//   HeaderNav      — fixed positioned wrapper with scroll-driven frosted-glass surface

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── Palette & type helpers ───────────────────────────────────────────────────

const C = {
  bg:      '#FBFBF8',
  ink:     '#0E1410',
  ink2:    '#2A312D',
  mute:    '#6B7368',
  line:    '#E6E8E2',
  cyan:    '#74E0FF',
  cyanInk: '#0B1D27',
  green:   '#2F9E69',
} as const;

const geist = '"Geist", system-ui, sans-serif';

// ─── Wordmark ─────────────────────────────────────────────────────────────────

export function Wordmark({
  markSize = 38,
  fontSize = 22,
  color = C.ink,
  asset = 'bigblack',
}: {
  markSize?: number;
  fontSize?: number;
  color?: string;
  asset?: 'bigblack' | 'bigwhite';
}) {
  return (
    <Link
      to="/"
      style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
    >
      <img
        src={`/assets/${asset}.png`}
        alt="Gensaki mark"
        style={{ width: markSize, height: markSize, objectFit: 'cover', marginLeft: 20 }}
      />
      <span style={{
        fontFamily: geist, fontSize, fontWeight: 500,
        letterSpacing: '-0.3px', color,
      }}>
        Gensaki
      </span>
    </Link>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

export function NavLink({
  title,
  chevron = false,
  isActive = false,
  onClick,
}: {
  title: string;
  chevron?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  const active = isActive || h;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: geist, fontSize: 15, fontWeight: 400,
        color: active ? C.ink : C.ink2,
        padding: '8px 0', position: 'relative',
        transition: 'color 0.12s ease-out',
      }}
    >
      {title}
      {chevron && <span style={{ fontSize: 9, opacity: 0.5, marginTop: 1 }}>▾</span>}
      <span style={{
        position: 'absolute', bottom: -5, left: 0, right: 0, height: 2,
        background: C.ink,
        transform: active ? 'scaleX(1)' : 'scaleX(0)',
        opacity: isActive ? 1 : h ? 0.5 : 0,
        transition: 'transform 0.12s ease-out, opacity 0.12s ease-out',
        transformOrigin: 'center',
      }} />
    </button>
  );
}

// ─── CTAButton ────────────────────────────────────────────────────────────────

export type CTAKind = 'ink' | 'cyan' | 'ghost';

export function CTAButton({
  title,
  kind = 'ink',
  onClick,
}: {
  title: string;
  kind?: CTAKind;
  onClick?: () => void;
}) {
  const [h, setH] = useState(false);

  const fg  = kind === 'ink' ? '#fff' : kind === 'cyan' ? C.cyanInk : h ? C.ink : C.ink2;
  const bg  = kind === 'ink' ? C.ink  : kind === 'cyan' ? C.cyan    : 'transparent';
  const bdr = kind === 'ghost' ? `1px solid ${h ? C.line : 'transparent'}` : 'none';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9,
        fontFamily: geist, fontSize: 15, fontWeight: 500,
        color: fg, background: bg, border: bdr,
        borderRadius: 10, padding: kind === 'ghost' ? '13px 18px' : '13px 20px',
        cursor: 'pointer', outline: 'none',
        transform: h ? 'scale(1.012)' : 'scale(1)',
        transition: 'all 0.15s ease-out',
        boxShadow: h && kind !== 'ghost' ? 'inset 0 0 0 1000px rgba(255,255,255,0.10)' : 'none',
      }}
    >
      {title}
      <span style={{
        transform: h ? 'translate(2px,-2px)' : 'translate(0,0)',
        transition: 'transform 0.15s ease-out', opacity: 0.92,
      }}>
        ↗︎
      </span>
    </button>
  );
}

// ─── HeroEyebrow ─────────────────────────────────────────────────────────────
// Live-status pill used in hero sections across pages.

export function HeroEyebrow({ text }: { text: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '6px 12px',
      background: 'rgba(255,255,255,0.6)',
      border: `1px solid ${C.line}`,
      borderRadius: 999,
    }}>
      <span style={{ position: 'relative', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: `${C.green}2E`, position: 'absolute' }} />
        <span style={{ width: 6,  height: 6,  borderRadius: '50%', background: C.green, position: 'relative', zIndex: 1 }} />
      </span>
      <span style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace', fontSize: 12, color: C.mute }}>{text}</span>
    </div>
  );
}

// ─── GensakiNav ───────────────────────────────────────────────────────────────
// The horizontal nav bar: wordmark left, links + CTA right.
// Accepts an optional selectedItem to highlight the active route.

export function GensakiNav({
  isCompact,
  selectedItem = null,
  onSelectItem,
}: {
  isCompact: boolean;
  selectedItem?: string | null;
  onSelectItem?: (v: string | null) => void;
}) {
  const hPad = isCompact ? 20 : 40;

  return (
    <div style={{ padding: `0 ${hPad}px` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 48, padding: '26px 0' }}>
          <Wordmark markSize={46} fontSize={24} />
          {!isCompact ? (
            <>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                {(['Benchmark', 'FitScore', 'Diligence', 'RegWatch'] as const).map(name => (
                  <NavLink
                    key={name}
                    title={name}
                    isActive={selectedItem === name}
                    onClick={() => onSelectItem?.(name)}
                  />
                ))}
                <NavLink title="Sign in" onClick={() => onSelectItem?.('AuthViews')} />
                <CTAButton title="Request Free Demo" kind="cyan" onClick={() => onSelectItem?.('SignUp')} />
              </div>
            </>
          ) : (
            <>
              <div style={{ flex: 1 }} />
              <CTAButton title="Demo" kind="cyan" onClick={() => onSelectItem?.('SignUp')} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HeaderNav ────────────────────────────────────────────────────────────────
// Fixed-positioned wrapper around GensakiNav.
// Always visible; the frosted-glass background fades in as the user scrolls
// past 50 px and is fully opaque by 80 px.

export function HeaderNav({
  isCompact,
  selectedItem = null,
  onSelectItem,
  scrollRef,
}: {
  isCompact: boolean;
  selectedItem?: string | null;
  onSelectItem?: (v: string | null) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [progress, setProgress] = useState(0); // 0 = hero-blended, 1 = fully frosted

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      setProgress(Math.min(1, Math.max(0, (y - 50) / 30))); // ramp 50 → 80 px
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef]);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        opacity: 1,
        pointerEvents: 'auto',
        background: `rgba(251,251,248,${0.72 * progress})`,
        backdropFilter: progress > 0 ? `blur(${18 * progress}px)` : 'none',
        WebkitBackdropFilter: progress > 0 ? `blur(${18 * progress}px)` : 'none',
        borderBottom: progress > 0.5 ? `1px solid rgba(230,232,226,${progress})` : 'none',
        transition: 'background 0.25s ease-out',
      }}
    >
      <GensakiNav
        isCompact={isCompact}
        selectedItem={selectedItem}
        onSelectItem={onSelectItem}
      />
    </div>
  );
}
