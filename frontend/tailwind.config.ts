/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                fleet: {
                    blue: {
                        light: '#00B4D8', // Cyan/Teal from logo
                        DEFAULT: '#0077B6', // Primary Blue from logo
                        dark: '#023E8A', // Dark Blue from logo
                    },
                    gray: '#6B7280',
                    white: '#FFFFFF',
                },
                primary: {
                    DEFAULT: '#0077B6',
                    foreground: '#FFFFFF',
                },
                sidebar: {
                    DEFAULT: '#F8FAFC',
                    foreground: '#1E293B',
                    active: '#E2E8F0',
                }
            },
            backgroundImage: {
                'gradient-fleet': 'linear-gradient(135deg, #0077B6 0%, #00B4D8 100%)',
            },
            boxShadow: {
                'premium': '0 4px 20px -2px rgba(0, 119, 182, 0.15), 0 2px 10px -2px rgba(0, 180, 216, 0.1)',
            }
        },
    },
    plugins: [],
};
