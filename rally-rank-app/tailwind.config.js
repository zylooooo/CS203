/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "primary-color-green": "#54C761",
                "primary-color-white": "#FFFFFF",
                "primary-color-black": "#262626",
                "secondary-color-dark-green": "#10574E",
                "secondary-color-light-gray": "#525252",
                "secondary-color-light-green": "#CDF731",
                "red-color": "#FF0000",
            },
        },
    },
    plugins: [],
};
