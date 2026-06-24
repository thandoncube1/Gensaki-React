// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'g-bg':        '#FBFBF8',
        'g-ink':       '#0E1410',
        'g-ink2':      '#2A312D',
        'g-mute':      '#6B7368',
        'g-mute2':     '#9AA29A',
        'g-line':      '#E6E8E2',
        'g-card':      '#F4F5F0',
        'g-card2':     '#EDEFE9',
        'g-cyan':      '#74E0FF',
        'g-cyan-ink':  '#0B1D27',
        'g-green':     '#2F9E69',
        'g-navy':      '#0B1320',
        'g-navy-mute': '#9DA8B8',
        'g-mint1':     '#E7F6EC',
        'g-mint2':     '#F1FBF3',
      },
      fontFamily: {
        geist: ['"Geist"', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      screens: {
        compact: { max: '1079px' },   // mirrors Swift isCompact < 1080
      },
    },
  },
  plugins: [],
} satisfies Config;
