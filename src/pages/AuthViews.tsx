// src/pages/AuthViews.tsx
// Converted from AuthViews.swift (Gensaki SRT platform)
// Stack: React + TypeScript + Tailwind CSS + Vite

import React, { useState, useRef, useEffect } from 'react';
import { Wordmark } from '../components/HeaderNav';

// ─── Palette (same tokens as WebLandingPage) ─────────────────────────────────

const C = {
  bg:       '#FBFBF8',
  ink:      '#0E1410',
  ink2:     '#2A312D',
  mute:     '#6B7368',
  line:     '#E6E8E2',
  cyan:     '#74E0FF',
  cyanInk:  '#0B1D27',
  green:    '#2F9E69',
  mint1:    '#E7F6EC',
  mint2:    '#F1FBF3',
  navy:     '#0B1D27',
  navyText: '#EAF1F0',
  navyMute: '#8AA1A8',
} as const;

function ff(family: 'geist' | 'mono'): string {
  return family === 'geist'
    ? '"Geist", system-ui, sans-serif'
    : '"JetBrains Mono", "Courier New", monospace';
}

// ─── BackLink ─────────────────────────────────────────────────────────────────

function BackLink({ short, onGoBack }: { short: boolean; onGoBack: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onGoBack}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 500,
        color: h ? C.ink2 : C.mute,
        transition: 'color 0.12s ease-out', padding: 0,
      }}
    >
      {/* ‹ chevron approximates SF Symbol chevron.left */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" style={{ opacity: 0.7 }}>
        <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {short ? 'Back' : 'Back Home'}
    </button>
  );
}

// ─── WideButton ───────────────────────────────────────────────────────────────
// Full-width ink / ghost button matching the site CTAs.

type BtnKind = 'ink' | 'ghost';

function WideButton({ title, kind = 'ink', icon, onClick }: {
  title: string; kind?: BtnKind; icon?: React.ReactNode; onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        width: '100%', padding: '14px 20px',
        fontFamily: ff('geist'), fontSize: 15, fontWeight: 500,
        color: kind === 'ink' ? '#fff' : C.ink,
        background: kind === 'ink' ? C.ink : '#fff',
        border: kind === 'ghost' ? `1px solid ${C.line}` : 'none',
        borderRadius: 10, cursor: 'pointer', outline: 'none',
        transform: h ? 'scale(1.006)' : 'scale(1)',
        transition: 'all 0.15s ease-out',
        boxShadow: h && kind === 'ink' ? 'inset 0 0 0 1000px rgba(255,255,255,0.10)' : 'none',
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center', fontSize: 14 }}>{icon}</span>}
      {title}
    </button>
  );
}

// ─── LinkText ─────────────────────────────────────────────────────────────────
// Inline underline-on-hover text link.

function LinkText({ text, size = 13.5, color = C.ink, onClick }: {
  text: string; size?: number; color?: string; onClick?: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontFamily: ff('geist'), fontSize: size, fontWeight: 500, color,
        position: 'relative', lineHeight: 'inherit',
      }}
    >
      {text}
      <span style={{
        position: 'absolute', bottom: -3, left: 0, right: 0, height: 1,
        background: color, opacity: h ? 0.5 : 0,
        transition: 'opacity 0.12s ease-out',
      }} />
    </button>
  );
}

// ─── CheckRow ─────────────────────────────────────────────────────────────────
// Custom checkbox: navy fill + cyan SVG tick when checked.

function CheckRow({ checked, onChange, text }: {
  checked: boolean; onChange: (v: boolean) => void; text: string;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? C.cyanInk : '#fff',
        border: checked ? 'none' : `1.4px solid ${C.line}`,
        transition: 'background 0.12s ease-out, border 0.12s ease-out',
        position: 'relative',
      }}>
        <input
          type="checkbox" checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        {checked && (
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
            <path d="M1 4L4 7L10 1" stroke={C.cyan} strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{
        fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 400,
        color: C.ink2, lineHeight: 1.5,
      }}>
        {text}
      </span>
    </label>
  );
}

// ─── AuthField ────────────────────────────────────────────────────────────────
// Labelled input with focus ring and optional password-reveal toggle.

type FieldName = 'name' | 'email' | 'org' | 'password';

interface AuthFieldProps {
  label: string;
  placeholder?: string;
  fieldName: FieldName;
  value: string;
  onChange: (v: string) => void;
  isSecure?: boolean;
  isNew?: boolean;        // newPassword content-type hint
  focused: FieldName | null;
  onFocus: (f: FieldName) => void;
  onBlur: () => void;
}

function AuthField({
  label, placeholder = '', fieldName, value, onChange,
  isSecure = false, isNew = false,
  focused, onFocus, onBlur,
}: AuthFieldProps) {
  const [reveal, setReveal] = useState(false);
  const isOn = focused === fieldName;

  const inputType = isSecure && !reveal ? 'password'
    : fieldName === 'email' ? 'email'
    : 'text';

  const autoComplete =
    fieldName === 'email'    ? 'email'
    : fieldName === 'name'   ? 'name'
    : fieldName === 'org'    ? 'organization'
    : isNew                  ? 'new-password'
    : 'current-password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{
        fontFamily: ff('mono'), fontSize: 11, letterSpacing: '0.3px', color: C.mute,
      }}>
        {label}
      </span>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '13px 14px',
        background: '#fff',
        borderRadius: 10,
        border: `${isOn ? 1.5 : 1}px solid ${isOn ? `${C.cyanInk}99` : C.line}`,
        boxShadow: isOn ? `0 0 0 3px ${C.cyan}59` : 'none',
        transition: 'border-color 0.15s ease-out, box-shadow 0.15s ease-out',
      }}>
        <input
          type={inputType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => onFocus(fieldName)}
          onBlur={onBlur}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: ff('geist'), fontSize: 15, fontWeight: 400, color: C.ink,
            caretColor: C.cyanInk,
          }}
        />
        {isSecure && (
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: C.mute, lineHeight: 1, display: 'flex', alignItems: 'center',
            }}
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            {/* Eye icon SVGs — approximates SF Symbol eye / eye.slash */}
            {reveal ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M6.5 6.7A2 2 0 0 0 9.3 9.5M3.3 4.4C1.9 5.5 1 7 1 7s2.5 5 7 5c1.4 0 2.6-.4 3.7-1M5 3.5C5.9 3.2 6.9 3 8 3c4.5 0 7 5 7 5s-.7 1.4-2 2.7" stroke={C.mute} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke={C.mute} strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" stroke={C.mute} strokeWidth="1.3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── OrDivider ────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, height: 1, background: C.line }} />
      <span style={{ fontFamily: ff('mono'), fontSize: 11, color: C.mute }}>or</span>
      <div style={{ flex: 1, height: 1, background: C.line }} />
    </div>
  );
}

// ─── LockIcon ─────────────────────────────────────────────────────────────────
// Approximates SF Symbol lock.shield for the SSO button.

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="3" y="6" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 6V4.5a2 2 0 0 1 4 0V6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ─── BrandPanelContent ────────────────────────────────────────────────────────
// Navy right panel — wide layout only.

function BrandPanelContent() {
  const lines = [
    'Regulatory Radar, primary-source intelligence',
    'SRT fit analysis for your balance sheet',
    'The GIST benchmark of capital sophistication',
    'End-to-end execution to institutional providers',
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      padding: 48, height: '100%', boxSizing: 'border-box',
    }}>
      <Wordmark markSize={46} fontSize={24} color={C.navyText} asset="bigwhite" />

      <div style={{ flex: 1, minHeight: 40 }} />

      {/* Headline */}
      <div style={{ marginBottom: 28 }}>
        <span style={{
          fontFamily: ff('geist'), fontSize: 34, fontWeight: 500,
          letterSpacing: '-1px', color: C.navyText, lineHeight: 1.25,
          display: 'block',
        }}>
          SRT infrastructure for
        </span>
        <span style={{
          fontFamily: ff('geist'), fontSize: 34, fontWeight: 400,
          letterSpacing: '-1px', color: C.navyMute, lineHeight: 1.25,
          display: 'block',
        }}>
          community banks and credit unions
        </span>
      </div>

      {/* Feature lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontFamily: ff('mono'), fontSize: 13, color: C.cyan, flexShrink: 0 }}>
              {'//'}
            </span>
            <span style={{
              fontFamily: ff('mono'), fontSize: 13,
              color: `${C.navyText}D1`, lineHeight: 1.5,
            }}>
              {line}
            </span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 40 }} />

      <div style={{ fontFamily: ff('mono'), fontSize: 11.5, color: C.navyMute }}>
        Where capital meets possibility.
      </div>
    </div>
  );
}

// ─── AuthView (root) ──────────────────────────────────────────────────────────

export type AuthMode = 'signIn' | 'signUp';

export interface AuthViewProps {
  initialMode?: AuthMode;
  onSelectItem?: (v: string | null) => void;
}

export default function AuthView({
  initialMode = 'signIn',
  onSelectItem,
}: AuthViewProps) {
  const [mode,     setMode]     = useState<AuthMode>(initialMode);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [org,      setOrg]      = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [agree,    setAgree]    = useState(false);
  const [focused,  setFocused]  = useState<FieldName | null>(null);
  const [isCompact, setIsCompact] = useState(() => window.innerWidth < 900);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setIsCompact(e.contentRect.width < 900));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const switchMode = () => {
    setMode(m => (m === 'signIn' ? 'signUp' : 'signIn'));
    setName(''); setEmail(''); setOrg(''); setPassword('');
    setRemember(false); setAgree(false); setFocused(null);
  };

  // TODO: wire to auth backend
  const submit = (e?: React.FormEvent) => { e?.preventDefault(); };

  const goBack = () => onSelectItem?.('Home');

  // ── Form column ─────────────────────────────────────────────────────────────

  const formColumn = (
    <form onSubmit={submit} style={{ maxWidth: 420, width: '100%' }}>

      {/* Eyebrow */}
      <div style={{
        fontFamily: ff('mono'), fontSize: 11, letterSpacing: '1px',
        color: C.mute, marginBottom: 14,
      }}>
        {mode === 'signIn' ? 'WELCOME BACK' : 'GET STARTED'}
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: ff('geist'), fontSize: isCompact ? 30 : 38, fontWeight: 500,
        letterSpacing: '-1px', color: C.ink, marginBottom: 8,
      }}>
        {mode === 'signIn' ? 'Sign in' : 'Create your account'}
      </div>

      {/* Subtext */}
      <div style={{
        fontFamily: ff('geist'), fontSize: 15, fontWeight: 400,
        color: C.mute, lineHeight: 1.5, marginBottom: 26,
      }}>
        {mode === 'signIn'
          ? 'Access your Gensaki workspace.'
          : 'Start with Regulatory Radar, fit analysis, and the GIST benchmark.'}
      </div>

      {/* SSO */}
      <WideButton
        title="Continue with single sign-on"
        kind="ghost"
        icon={<LockIcon />}
        onClick={submit}
      />

      <div style={{ margin: '18px 0' }}><OrDivider /></div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        {mode === 'signUp' && (
          <AuthField
            label="Full name" placeholder="Jane Smith"
            fieldName="name" value={name} onChange={setName}
            focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)}
          />
        )}
        <AuthField
          label="Work email" placeholder="you@yourbank.com"
          fieldName="email" value={email} onChange={setEmail}
          focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)}
        />
        {mode === 'signUp' && (
          <AuthField
            label="Institution" placeholder="Your bank or institution"
            fieldName="org" value={org} onChange={setOrg}
            focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)}
          />
        )}
        <AuthField
          label="Password"
          placeholder={mode === 'signUp' ? 'Create a password' : 'Enter your password'}
          fieldName="password" value={password} onChange={setPassword}
          isSecure isNew={mode === 'signUp'}
          focused={focused} onFocus={setFocused} onBlur={() => setFocused(null)}
        />
      </div>

      {/* Remember / forgot  OR  agree to terms */}
      {mode === 'signIn' ? (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
          <CheckRow checked={remember} onChange={setRemember} text="Remember me" />
          <div style={{ flex: 1 }} />
          <LinkText text="Forgot password?" color={C.ink} onClick={submit} />
        </div>
      ) : (
        <div style={{ marginBottom: 22 }}>
          <CheckRow
            checked={agree} onChange={setAgree}
            text="I agree to the Terms of Service and Privacy Policy."
          />
        </div>
      )}

      {/* Primary CTA */}
      <WideButton
        title={mode === 'signIn' ? 'Sign in' : 'Create account'}
        kind="ink"
        onClick={submit}
      />

      {/* Mode toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, marginTop: 20,
      }}>
        <span style={{
          fontFamily: ff('geist'), fontSize: 13.5, fontWeight: 400, color: C.mute,
        }}>
          {mode === 'signIn' ? 'New to Gensaki?' : 'Already have an account?'}
        </span>
        <LinkText
          text={mode === 'signIn' ? 'Create an account' : 'Sign in'}
          color={C.ink}
          onClick={switchMode}
        />
      </div>
    </form>
  );

  // ── Top bar ─────────────────────────────────────────────────────────────────

  const topBar = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isCompact ? (
        <>
          <Wordmark markSize={34} fontSize={19} asset="bigblack" />
          <div style={{ flex: 1 }} />
          <BackLink short onGoBack={goBack} />
        </>
      ) : (
        <BackLink short={false} onGoBack={goBack} />
      )}
    </div>
  );

  // ── Legal footer ─────────────────────────────────────────────────────────────

  const legalFooter = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{
        fontFamily: ff('mono'), fontSize: 11,
        color: `${C.mute}D9`, flex: 1,
      }}>
        © 2026 Gensaki Inc.
      </span>
      <LinkText text="Terms"   size={12} color={C.mute} onClick={submit} />
      <LinkText text="Privacy" size={12} color={C.mute} onClick={submit} />
      <LinkText text="Contact" size={12} color={C.mute} onClick={submit} />
    </div>
  );

  const heroWash = [
    `linear-gradient(to bottom, #F2FBF4, ${C.bg} 50%)`,
    `radial-gradient(ellipse at 50% 0%, ${C.mint1}, ${C.mint2}, transparent 520px)`,
  ].join(', ');

  // ── Compact (< 900 px): single column on mint wash ───────────────────────────

  if (isCompact) {
    return (
      <div
        ref={containerRef}
        style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: heroWash }}
      >
        <div style={{ padding: '16px 22px 0' }}>{topBar}</div>

        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', justifyContent: 'center',
          padding: '22px 24px 16px',
        }}>
          {formColumn}
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.line}` }}>
          {legalFooter}
        </div>
      </div>
    );
  }

  // ── Wide (≥ 900 px): form left, navy brand panel right ───────────────────────

  return (
    <div ref={containerRef} style={{ height: '100vh', display: 'flex' }}>

      {/* Form side */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: C.bg, minWidth: 0,
      }}>
        <div style={{ padding: '30px 40px 0' }}>{topBar}</div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 40px',
        }}>
          {formColumn}
        </div>

        <div style={{ padding: '0 40px 26px' }}>{legalFooter}</div>
      </div>

      {/* Navy brand panel */}
      <div style={{
        width: '46%', flexShrink: 0,
        background: [
          `radial-gradient(ellipse at 85% 12%, ${C.cyan}29, transparent 460px)`,
          C.navy,
        ].join(', '),
      }}>
        <BrandPanelContent />
      </div>
    </div>
  );
}
