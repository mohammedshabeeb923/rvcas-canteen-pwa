import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rvcas: {
          maroon: "#6B1D2F",
          "maroon-dark": "#4A1220",
          "maroon-deep": "#380B16",
          "maroon-light": "#88283E",
          cream: "#FAF7F2",
          "cream-light": "#FDFBF8",
          "cream-dark": "#EFE9DE",
          gold: "#D4AF37",
          emerald: "#10B981",
          "emerald-dark": "#059669",
          "emerald-light": "#DCFCE7",
          slate: "#1E293B",
          muted: "#64748B",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
      },
      boxShadow: {
        subtle: "0 2px 8px -1px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)",
        card: "0 10px 25px -3px rgba(107, 29, 47, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 30px -10px rgba(107, 29, 47, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
};
export default config;
