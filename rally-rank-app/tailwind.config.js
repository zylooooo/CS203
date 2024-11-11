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
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                buttonExpand: {
                    '0%': { opacity: '0.8', width: 'auto', paddingLeft: '0', paddingRight: '0' },
                    '100%': { opacity: '1', width: 'auto', paddingLeft: '13px', paddingRight: '13px' },
                },
                buttonShrink: {
                    '0%': { opacity: '0.8', width: 'auto', paddingLeft: '13px', paddingRight: '13px' },
                    '100%': { opacity: '1', width: 'auto', paddingLeft: '0', paddingRight: '0' },
                },
            },
            animation: {
                dropDown: 'dropDown 1s ease-out forwards',
                riseUp: 'riseUp 2s ease-out forwards',
                fadeIn: 'fadeIn 1s ease-in-out forwards',
                buttonExpand: 'buttonExpand 0.5s ease-in-out forwards',
                buttonShrink: 'buttonShrink 0.5s ease-in-out forwards',
            },
        },
    },
    plugins: [],
};
