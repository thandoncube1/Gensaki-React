// src/components/PageFooter.tsx
// Shared marketing footer — extracted from WebLandingPage.tsx.
// Includes brand column, link columns, and copyright bar.

import { useState } from 'react';
import { Wordmark } from './HeaderNav';

const C = {
  ink:  '#0E1410',
  ink2: '#2A312D',
  mute: '#6B7368',
  line: '#E6E8E2',
} as const;

const geist = '"Geist", system-ui, sans-serif';
const mono  = '"JetBrains Mono", "Courier New", monospace';

function FooterLink({ text }: { text: string }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: geist, fontSize: 14, fontWeight: 400,
        color: h ? C.ink : C.ink2, padding: '6px 0',
        cursor: 'pointer', transition: 'color 0.1s ease-out',
      }}
    >
      {text}
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div style={{
        fontFamily: mono, fontSize: 11, letterSpacing: '0.7px',
        color: C.mute, textTransform: 'uppercase', marginBottom: 16,
      }}>
        {title}
      </div>
      {links.map((l, i) => <FooterLink key={i} text={l} />)}
    </div>
  );
}

function BrandCol() {
  return (
    <div>
      <Wordmark markSize={40} fontSize={20} />
      <p style={{
        fontFamily: geist, fontSize: 13, fontWeight: 400,
        color: C.mute, lineHeight: 1.6, maxWidth: 300, marginTop: 14,
      }}>
        A turnkey SRT execution platform. Headquartered in Toronto. Built for banks, credit unions, and the investors that protect them.
      </p>
    </div>
  );
}

function FooterColumns() {
  return (
    <>
      <FooterColumn title="// Products"  links={['Structuring Engine', 'Documentation Rails', 'Investor Matching', 'Lifecycle Automation', 'Recognition Checks']} />
      <FooterColumn title="// Solutions" links={['Credit Unions', 'Community Banks', 'Regional Banks', 'Asset Managers', 'Reinsurers']} />
      <FooterColumn title="// Resources" links={['Benchmark', 'FitScore', 'Diligence', 'RegWatch', 'Linkedin ↗︎']} />
      <FooterColumn title="// Company"   links={['About', 'Careers', 'Press', 'Contact', 'Security']} />
    </>
  );
}

export function PageFooter({ isCompact }: { isCompact: boolean }) {
  const hPad = isCompact ? 20 : 40;

  return (
    <div style={{ padding: `0 ${hPad}px` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Brand + link columns */}
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 48 }}>
          {isCompact ? (
            <>
              <BrandCol />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 40 }}>
                <FooterColumns />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 320px' }}><BrandCol /></div>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
                <FooterColumns />
              </div>
            </div>
          )}
        </div>

        {/* Copyright bar */}
        <div style={{
          paddingTop: 48, paddingBottom: 40,
          fontFamily: mono, fontSize: 11.5, letterSpacing: '0.4px', color: C.mute,
        }}>
          {isCompact ? (
            <>
              <div>Gensaki, © 2026, All rights reserved</div>
              <div style={{ marginTop: 10 }}>Privacy · Terms</div>
            </>
          ) : (
            <div style={{ display: 'flex' }}>
              <span style={{ flex: 1 }}>Gensaki, © 2026, All rights reserved</span>
              <span>Privacy   ·   Terms</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
