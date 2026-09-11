import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gem: {
          blue: "#0c3b88",
          navy: "#0a2558",
          orange: "#f37021",
          green: "#0b8a42",
          gray: "#f4f6f9",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
