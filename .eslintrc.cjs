module.exports = {
  env: { browser: true, es2024: true },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  settings: { react: { version: "detect" } },
  plugins: ["react"],
  rules: {
    "react/prop-types": "off",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
  }
}
