/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@openlaw-au/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ...colors,
                'unfocussed-gray': 'rgba(0, 0, 0, 0.5)',
                'unfocussed-light': 'rgba(0, 0, 0, 0.15)',
                'jade-primary': '#069444',
                'jade-secondary': '#2F4065',
                'caption-gray': '#6B7280',
                'bflsa-red': 'rgb(217, 60, 62)',
                brand: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    800: '#1E40AF',
                    900: '#1E3A8A',
                    950: '#172554',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    muted: '#F8FAFC',
                    subtle: '#F1F5F9',
                },
                ink: {
                    900: '#0F172A',
                    700: '#334155',
                    500: '#64748B',
                    300: '#CBD5E1',
                },
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
                merriweather: ['Merriweather', 'serif'],
                openSans: ['Open Sans', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
                merriweatherSans: ['Merriweather Sans', 'sans-serif'],
                plexSans: ['IBM Plex Sans', 'sans-serif'],
                montserrat: ['Montserrat', 'sans-serif'],
                alegreyaSans: ['Alegreya Sans', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
                'card': '0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
                'elevated': '0 12px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
                'brand-glow': '0 10px 30px -10px rgba(37, 99, 235, 0.45)',
            },
            borderRadius: {
                'xl2': '1rem',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.25s ease-out',
                'fade-in-up': 'fade-in-up 0.4s ease-out both',
                'shimmer': 'shimmer 2s linear infinite',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 55%, #1E3A8A 100%)',
                'brand-gradient-soft': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1E40AF 100%)',
                'brand-radial': 'radial-gradient(circle at top left, rgba(37,99,235,0.22), transparent 60%)',
                'mesh-blue': 'radial-gradient(at 20% 20%, rgba(59,130,246,0.22) 0px, transparent 50%), radial-gradient(at 80% 30%, rgba(37,99,235,0.18) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(96,165,250,0.18) 0px, transparent 50%)',
            },
        },
    },
    plugins: [],
}
