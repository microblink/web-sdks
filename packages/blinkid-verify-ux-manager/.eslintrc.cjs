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
      },
      plugins: ["@typescript-eslint", "solid", "compat"],
      parser: "@typescript-eslint/parser",
      rules: {
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-non-null-assertion": 0,
        "@typescript-eslint/consistent-type-definitions": 0,
        "prefer-const": 0,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      extends: [
        "eslint:recommended",
        "plugin:solid/typescript",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:compat/recommended",
        "prettier",
      ],
    },
    {
      files: ["**/*.{js,mjs,cjs}"],
      env: {
        node: true,
        browser: true,
        es2021: true,
      },
      extends: ["eslint:recommended"],
      rules: {
        "no-unused-vars": 0,
      },
    },
  ],
});
