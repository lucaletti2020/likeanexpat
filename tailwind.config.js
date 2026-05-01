/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "confetti-fall": {
          "0%":   { transform: "translateY(-10px) rotate(0deg)",   opacity: "1" },
          "100%": { transform: "translateY(110vh) rotate(720deg)", opacity: "0" },
        },
        "bounce-once": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%":      { transform: "translateY(-20px)" },
          "60%":      { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "confetti-fall": "confetti-fall linear forwards",
        "bounce-once": "bounce-once 0.8s ease-out 0.2s both",
      },
    },
  },
  plugins: [],
};
