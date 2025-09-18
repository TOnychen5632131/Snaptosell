import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#2563EB",
          accent: "#22D3EE"
        },
        surface: {
          base: "#FFFFFF",
          muted: "#F2F4F7"
        }
      },
      boxShadow: {
        soft: "0 16px 30px -15px rgba(15,23,42,0.25)",
        card: "0 12px 25px -12px rgba(15,23,42,0.18)"
      },
      borderRadius: {
        card: "1.75rem"
      }
    }
  },
  plugins: []
};

export default config;
