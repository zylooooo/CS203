/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "primary-color-green": "#2C742C",
                "primary-color-light-green": "#41A250",
                "primary-color-white": "#FFFFFF",
                "primary-color-black": "#262626",
                "secondary-color-dark-green": "#2D5A35",
                "secondary-color-light-gray": "#525252",
                "secondary-color-red": "#FF6961",
                "text-grey": "#242424",
            },

            keyframes: {
                dropDown: {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                riseUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            },
            animation: {
                dropDown: 'dropDown 1s ease-out forwards',
                riseUp: 'riseUp 2s ease-out forwards',
            },
        },
    },
    plugins: [],
};
