import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1240px" } },
    extend: {
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        sans: ["Archivo", "'IBM Plex Sans Arabic'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        border: c("border"),
        input: c("input"),
        ring: c("ring"),
        background: c("background"),
        foreground: c("foreground"),
        paper: c("paper"),
        plaque: c("plaque"),
        panel: { DEFAULT: c("panel"), foreground: c("panel-foreground"), muted: c("panel-muted") },
        primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
        secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
        accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
        destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
        success: { DEFAULT: c("success"), foreground: c("success-foreground") },
        warning: { DEFAULT: c("warning"), foreground: c("warning-foreground") },
        muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
        popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
        card: { DEFAULT: c("card"), foreground: c("card-foreground") },
      },
      borderRadius: { lg: "14px", md: "10px", sm: "6px" },
      keyframes: {
        slide: { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(300%)" } },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "none" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "fade-up": "fade-up .6s cubic-bezier(.2,.7,.2,1) both",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
