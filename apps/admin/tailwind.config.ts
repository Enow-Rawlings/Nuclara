import type { Config } from 'tailwindcss'

// Admin uses the same design tokens as storefront but tuned for operational density
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'midnight-navy': '#10243A',
        'scientific-teal': '#087E8B',
        'pale-ice': '#EAF4F5',
        'cloud-white': '#FAFCFD',
        slate: '#536273',
        graphite: '#202A35',
        'border-grey': '#DCE4EA',
        'success-green': '#237A57',
        'warning-amber': '#9A5B00',
        'error-red': '#B42318',
        // Admin sidebar specific
        'sidebar-bg': '#0D1E30',
        'sidebar-hover': '#16304A',
        'sidebar-active': '#087E8B',
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'h1-desktop': ['clamp(24px, 3vw, 32px)', { lineHeight: '1.2', fontWeight: '700' }],
        'h2-desktop': ['clamp(20px, 2.5vw, 24px)', { lineHeight: '1.25', fontWeight: '600' }],
        'h3-desktop': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5' }],
        'body-md': ['14px', { lineHeight: '1.5' }],
        'body-sm': ['13px', { lineHeight: '1.4' }],
        label: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(16 36 58 / 0.08), 0 1px 2px -1px rgb(16 36 58 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(16 36 58 / 0.1), 0 2px 4px -2px rgb(16 36 58 / 0.06)',
        modal: '0 20px 25px -5px rgb(16 36 58 / 0.15), 0 8px 10px -6px rgb(16 36 58 / 0.1)',
      },
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
