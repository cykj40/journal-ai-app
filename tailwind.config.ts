import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            colors: {
                parchment: '#F5F2EC',
                forest: '#3D4A3A',
                'forest-muted': '#6B7A66',
                sage: '#5C7A52',
                'sage-light': '#C9D5B8',
            },
            fontFamily: {
                serif: ['var(--font-playfair)', 'Georgia', 'serif'],
                sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
export default config 