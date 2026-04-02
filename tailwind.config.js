/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      ssm: "480px",
      sm: "680px",
      sxm: "700px",
      md: "768px",
      lg: "1100px",
      llg: "1280px",
      xl: "1380px",
      "2xl": "1480px",
      "3xl": "1680px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)", "sans-serif"],
        roboto: ["var(--font-roboto)"],
      },
      colors: {
        primary: {
          DEFAULT: "#2F3349",
        },
        secondary: "#99a1af",
        navy: "#1A1A1A",
        menucolor: "#444050",
        menubackground: "#EEEFEF",
        muted: "#808390",
        bggray: "#e6e6e8",
        lightpurple: "#7367f0",
        lightgreen: "#00bad1",
        lightred: "#ff4c51",
        // Meta UI/UX Chart Colors
        "chart-primary": "#0668E1",
        "chart-secondary": "#7B5BE7",
        "chart-accent-cyan": "#00D4FF",
        "chart-accent-teal": "#14B8A6",

        // Background Colors
        lightbgbase: "#FAFAFA",
        darkbgbase: "#0A0A0A",
        bgwhite: "#ffffff",
        bgblack: "#000000",
        bgprimary: "#faf1ee",
        darkbgprimary: "#1A1A1A",
        darkbgsecondary: "#262626",
        primarycolor: "#C7FE1E",
        secondarycolor: "#C7FE1E",
        primaryhover: "#C7FE1E21",
        borderprimary: "#50573A",
        secondaryhover: "#C7FE1E",
        sidebartext: "#FAFAFA",
        darkhoverbgprimary: "#262626",
        bgblue: "#155DFC",
        bgorange: "#C7FE1E",
        bgpurple: "#9810FA",
        hoverbg: "#191919",
        bgpurple1: "#4F46E5",
        // Text Colors
        textprimary: "#000",
        textparagraph: "#919191",
        textparagraphlight: "#99A1AF",
        textparagraphlight2: "#D1D1C6",
        darktextparagraphlight: "#D1D5D0",
        // Sidebar Links
        sidebarlinkcolor: "#61230b",
        sidebarlinkcolor50: "#61230b0f",
        sidebarlinkhovercolor: "#ffffff",
        sidebarlinkactivecolor: "#000000",
        sidebarbgcolor: "#61230b",
        sidebarhoverbgcolor: "#272727",
        sidebaractivebgcolor: "#623022",
        // Label Colors
        labelprimary: "#374151",
        darklabelprimary: "#d1d5db",
        // Border Colors
        bordercolor1: "#E5E7EB",
        bordercolor2: "#374151",
        darkbordercolor1: "#1e2939",
        bordergray100: "#f3f4f6",
        bordergray200: "#62302257",
      },
      fontSize: {
        heading: ["38px", { lineHeight: "48px", fontWeight: "500" }],
        subheading: ["24px", { lineHeight: "38px", fontWeight: "500" }],
        title: ["18px", { lineHeight: "28px", fontWeight: "500" }],
        subtitle: ["15px", { lineHeight: "24px", fontWeight: "500" }],
        content: ["13px", { lineHeight: "20px", fontWeight: "400" }],
      },
      boxShadow: {
        custom: "0 4px 18px 0 rgba(47, 43, 61, 0.16)",
        customsm: "0 3px 12px 0 rgba(47, 43, 61, 0.14)",
      },
      borderRadius: {
        "1/2": "50%",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "pulse-slow": "pulse-slow 2s infinite ease-in-out",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".custom-container": {
          // maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "24px",
          paddingRight: "24px",
        },
      });
    },
  ],
};
