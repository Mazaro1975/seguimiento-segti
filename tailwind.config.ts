import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        estado: {
          prendido: "#0ca30c",
          siniciar: "#fab219",
          pausado: "#ec835a",
          aplazado: "#ec835a",
          cerrado: "#898781",
          cancelado: "#d03b3b",
          sinestado: "#c3c2b7",
        },
      },
    },
  },
  plugins: [],
};

export default config;
