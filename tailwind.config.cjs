/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}'
  ],
  safelist: [
    {
      pattern:
        /^(bg|text|border|from|to|via|ring)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white|transparent)(-(50|100|200|300|400|500|600|700|800|900|950))?$/,
      variants: ['hover', 'focus', 'dark', 'sm', 'md', 'lg', 'xl', '2xl']
    },
    {
      pattern:
        /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y)-(0|0\\.5|1|1\\.5|2|2\\.5|3|3\\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|px|auto)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl']
    },
    {
      pattern:
        /^(w|h|min-w|min-h|max-w|max-h)-(0|0\\.5|1|1\\.5|2|2\\.5|3|3\\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|px|auto|full|screen|min|max|fit)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl']
    },
    {
      pattern: /^(grid-cols|col-span|row-span)-(1|2|3|4|5|6|7|8|9|10|11|12)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl']
    },
    {
      pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/,
      variants: ['sm', 'md', 'lg', 'xl', '2xl']
    },
    {
      pattern: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/
    },
    {
      pattern: /^leading-(none|tight|snug|normal|relaxed|loose)$/
    },
    {
      pattern: /^tracking-(tighter|tight|normal|wide|wider|widest)$/
    },
    {
      pattern: /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/
    },
    {
      pattern: /^shadow(-(sm|md|lg|xl|2xl|inner|none))?$/
    },
    {
      pattern: /^border(-(0|2|4|8))?$/
    },
    {
      pattern: /^opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)$/
    },
    {
      pattern: /^z-(0|10|20|30|40|50)$/
    },
    {
      pattern: /^line-clamp-(1|2|3|4|5|6)$/
    },
    {
      pattern: /^aspect-(auto|square|video)$/
    },
    {
      pattern: /^(flex|inline-flex|grid|block|inline-block|hidden)$/
    },
    {
      pattern: /^(items|justify|content|self|place)-(start|end|center|between|around|evenly|stretch)$/
    },
    {
      pattern: /^(object)-(contain|cover|fill|none|scale-down)$/
    },
    {
      pattern: /^(overflow|overflow-x|overflow-y)-(hidden|visible|auto|scroll)$/
    },
    {
      pattern: /^(absolute|relative|fixed|sticky)$/
    },
    {
      pattern: /^(top|right|bottom|left|inset)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|40|48|56|64)$/
    },
    {
      pattern: /^bg-gradient-to-(t|tr|r|br|b|bl|l|tl)$/
    },
    {
      pattern: /^prose(-(sm|lg|xl|2xl))?$/
    },
    'container',
    'mx-auto',
    'my-auto',
    'min-h-screen',
    'h-screen',
    'w-full',
    'h-full',
    'text-left',
    'text-center',
    'text-right',
    'uppercase',
    'lowercase',
    'capitalize',
    'underline',
    'no-underline',
    'list-disc',
    'list-decimal',
    'truncate',
    'whitespace-nowrap',
    'whitespace-pre-line'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: 'var(--color-ink)',
        slate: 'var(--color-slate)',
        paper: 'var(--color-paper)',
        panel: 'var(--color-panel)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        border: 'var(--color-border)'
      },
      boxShadow: {
        card: 'var(--shadow-card)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
