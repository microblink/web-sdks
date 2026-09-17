export default {
  "{apps,packages}/**/*.{ts,tsx,mts,cts}": "node packages/repo-utils/staged-typecheck.mts",
  "{apps,packages}/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx}": "pnpm lint --max-warnings=0",
  "apps/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx,css,md}": "pnpm exec oxfmt --check --no-error-on-unmatched-pattern",
  "packages/*/src/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx,css,md}":
    "pnpm exec oxfmt --check --no-error-on-unmatched-pattern",
  "packages/blinkcard-worker/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx}":
    "pnpm --dir packages/blinkcard-worker exec vitest related --run",
  "packages/blinkid-verify-worker/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx}":
    "pnpm --dir packages/blinkid-verify-worker exec vitest related --run",
  "packages/blinkid-worker/**/*.{js,cjs,mjs,jsx,ts,mts,cts,tsx}":
    "pnpm --dir packages/blinkid-worker exec vitest related --run",
};
