/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontSize: {
        h1: ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        h2: ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        h3: ["1.5rem", { lineHeight: "2rem" }], // 24px
        h4: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        h5: ["1rem", { lineHeight: "1.5rem" }], // 16px
        h6: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        p: ["1rem", { lineHeight: "1.5rem" }], // 16px
      },
    },
  },
  variants: {},
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        h1: { fontSize: theme("fontSize.h1") },
        h2: { fontSize: theme("fontSize.h2") },
        h3: { fontSize: theme("fontSize.h3") },
        h4: { fontSize: theme("fontSize.h4") },
        h5: { fontSize: theme("fontSize.h5") },
        h6: { fontSize: theme("fontSize.h6") },
        p: { fontSize: theme("fontSize.p") },
      });
    },
  ],
};
