const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,

  parserOptions: {
    ecmaVersion: "2022",
    sourceType: "module",
  },

  overrides: [
    {
      files: ["src/**/*.{ts,tsx}"],
      env: {
        browser: true,
        worker: true,
      },
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "compat"],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:compat/recommended",
        "prettier",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/consistent-type-definitions": 0,
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/array-type": "off",
      },
    },
    {
      files: ["*.{js,mjs,cjs}"],
    },
  ],
});
