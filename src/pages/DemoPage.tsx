// src/pages/DemoPage.tsx
import { useRef, useEffect, useState } from 'react';
import { HeaderNav } from '../components/HeaderNav';
import { PageFooter } from '../components/PageFooter';

const C = {
  bg:   '#FBFBF8',
  ink:  '#0E1410',
  mute: '#6B7368',
  line: '#E6E8E2',
  mint1: '#E7F6EC',
  green: '#2F9E69',
};

const FONT = '"Geist", system-ui, sans-serif';

const JOTFORM_ID  = '251241717195052';
const JOTFORM_SRC = `https://form.jotform.com/${JOTFORM_ID}`;

export default function DemoPage({ onSelectItem }: { onSelectItem: (v: string | null) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const outerRef  = useRef<HTMLDivElement>(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setIsCompact(entry.contentRect.width < 1080));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load JotForm embed handler once
  useEffect(() => {
    if (document.getElementById('jotform-embed-handler')) return;
    const script = document.createElement('script');
    script.id  = 'jotform-embed-handler';
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.onload = () => {
      (window as any).jotformEmbedHandler?.(
        `iframe[id='JotFormIFrame-${JOTFORM_ID}']`,
        'https://form.jotform.com/'
      );
    };
    document.body.appendChild(script);
    return () => { document.getElementById('jotform-embed-handler')?.remove(); };
  }, []);

  const hPad = isCompact ? 20 : 40;

  return (
    <div ref={outerRef} style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={scrollRef} style={{ width: '100%', height: '100%', overflowY: 'auto' }}>

        <HeaderNav isCompact={isCompact} scrollRef={scrollRef}
          selectedItem={null} onSelectItem={onSelectItem} />

        {/* Hero */}
        <div style={{
          background: `linear-gradient(to bottom, #F2FBF4, ${C.bg} 55%), radial-gradient(ellipse at 50% -20%, ${C.mint1}, #F1FBF3, transparent 60%)`,
          minHeight: '40vh', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ height: 80 }} />
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: `40px ${hPad}px` }}>
            <div style={{ maxWidth: 1180, width: '100%', margin: '0 auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 100, background: C.mint1,
                border: `1px solid ${C.green}30`, marginBottom: 20 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.green, letterSpacing: '0.06em',
                  textTransform: 'uppercase', fontFamily: FONT }}>
                  Request a Demo
                </span>
              </div>
              <h1 style={{ fontSize: isCompact ? 36 : 52, fontWeight: 700, color: C.ink,
                lineHeight: 1.08, margin: '0 0 16px', letterSpacing: '-0.025em', fontFamily: FONT }}>
                See Gensaki in action
              </h1>
              <p style={{ fontSize: 18, color: C.mute, margin: 0, maxWidth: 560,
                lineHeight: 1.6, fontFamily: FONT }}>
                Fill in the form below and our team will reach out to schedule a personalised walkthrough.
              </p>
            </div>
          </div>
        </div>

        {/* Form embed */}
        <div style={{ padding: `48px ${hPad}px 80px`, background: C.bg }}>
          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
            <iframe
              id={`JotFormIFrame-${JOTFORM_ID}`}
              title="Gensaki Demo Request Form"
              src={JOTFORM_SRC}
              allowTransparency
              allow="geolocation; microphone; camera; fullscreen"
              frameBorder={0}
              scrolling="no"
              onLoad={() => window.parent.scrollTo(0, 0)}
              style={{
                minWidth: '100%', maxWidth: '100%',
                height: 539, border: 'none', display: 'block',
                borderRadius: 16,
                boxShadow: '0 2px 24px rgba(14,20,16,0.07)',
              }}
            />
            {/* Cover the JotForm branding banner at the bottom of the iframe */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 66,
              background: '#f3f3fe',
              borderRadius: '0 0 16px 16px',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        <PageFooter isCompact={isCompact} />
      </div>
    </div>
  );
}
