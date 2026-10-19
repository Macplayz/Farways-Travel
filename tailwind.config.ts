import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Farways Research-Validated Design Tokens
        ink: {
          DEFAULT: "#0E2A47", // Deep navy for high-contrast, calm primary headings and text (WCAG AAA compliant)
          light: "#173B61",
          soft: "#234C75",
        },
        ocean: {
          DEFAULT: "#1F63B0", // Honest primary brand accent - stable, reliable blue
          dark: "#164A85",    // Interactive hover/active state
          light: "#3A7DCB",
        },
        sky: {
          DEFAULT: "#F0F6FD", // Ultra-clean background surface, reduces glare & visual fatigue
          deep: "#D8E9FB",    // High-visibility border / secondary surface token
          light: "#F7FAFE",
        },
        slate: {
          DEFAULT: "#4A5A6B", // Secondary body copy, strict WCAG AA contrast (> 4.5:1 on sky/white)
          muted: "#66788A",
          dark: "#323F4B",
        },
        line: {
          DEFAULT: "#E2EBF4", // Subtle, non-intrusive container borders
          subtle: "#EDF3F9",
          strong: "#C8D9E8",
        },
        green: {
          DEFAULT: "#15803D", // Reassuring confirmation / upfront transparency savings (WCAG AA)
          light: "#DCFCE7",
          dark: "#166534",
        },
        surface: {
          card: "#FFFFFF",
          subtle: "#F8FAFC",
          elevated: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(14, 42, 71, 0.05), 0 1px 2px -1px rgba(14, 42, 71, 0.05)',
        'card': '0 4px 6px -1px rgba(14, 42, 71, 0.06), 0 2px 4px -2px rgba(14, 42, 71, 0.04)',
        'modal': '0 20px 25px -5px rgba(14, 42, 71, 0.1), 0 8px 10px -6px rgba(14, 42, 71, 0.08)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
