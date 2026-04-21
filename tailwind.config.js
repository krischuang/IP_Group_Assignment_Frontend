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
                'bflsa-red': 'rgb(217, 60, 62)'
            },
            fontFamily: {
                inter: 'Inter',
                merriweather: 'Merriweather',
                openSans: 'Open Sans',
                lato: 'Lato',
                merriweatherSans: 'Merriweather Sans',
                plexSans: 'IBM Plex Sans',
                montserrat: 'Montserrat',
                alegreyaSans: 'Alegreya Sans'
            }
        }
    },
    plugins: []
}
