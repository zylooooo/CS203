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
                "red-color": "#FF0000",
                "text-grey": "#242424",
            },
        },
    },
    plugins: [],
};
