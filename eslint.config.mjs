import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────────────────────────────────────────
// Flat config (ESLint 9).
//
// Two things were wrong before:
//
//  1. NOTHING WAS IGNORED. Flat config does not read .eslintignore and only
//     skips node_modules by default, so `eslint .` walked .next/ and linted the
//     build output — 27,000 problems in generated code, which is why the run was
//     useless. Ignores are declared here instead.
//
//  2. .jsx / .tsx WERE NEVER LINTED. Flat config only lints .js/.mjs/.cjs unless
//     a config object names other extensions in `files`. Since this app is
//     almost entirely .jsx, linting a component reported "File ignored because
//     no matching configuration was supplied" and the real source was skipped.
//
// eslint-config-next 15.4.5 ships eslintrc-style configs only (no flat
// entrypoints), so FlatCompat is still the correct bridge here.
// ─────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'public/**',
      'next-env.d.ts',
    ],
  },

  // Declares which files ESLint should lint at all. Without this the .jsx that
  // makes up most of this app is invisible to the linter.
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Next's own rules (react, react-hooks, jsx-a11y, import) plus its TS setup.
  // 'prettier' comes last and turns OFF stylistic rules that would fight
  // `npm run format` — it does not run Prettier as a lint rule, which keeps the
  // lint fast and formatting a separate concern.
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),

  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    rules: {
      // Unused values are worth seeing, but not as build-blocking errors, and a
      // deliberately-ignored argument should be opt-out-able by convention.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // This is a JS/JSX codebase without prop-types; `any` shows up mainly in
      // the few .ts helpers. Visible, not fatal.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Leftover debugging is worth flagging — a stray console.log on the
      // subscriptions page shipped to production once already.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ── Demoted to warnings on purpose ──────────────────────────────────
      // `next build` runs ESLint and FAILS on any error. Because the old config
      // never matched .jsx, these rules were effectively never enforced, so
      // every pre-existing violation would now block deploys — a change to the
      // build gate that has nothing to do with fixing the config. They are
      // warnings so the signal is visible without breaking the pipeline;
      // promote them to 'error' once the backlog is cleared.

      // Cosmetic only: React already escapes text correctly, so an apostrophe
      // in copy renders fine. Escaping every one makes user-facing strings
      // markedly harder to read for no runtime benefit. (21 hits at present.)
      'react/no-unescaped-entities': 'warn',

      // A TypeScript rule reaching into a JS/JSX codebase where `require` is
      // legitimate. The one current hit is a deliberate lazy `require` of
      // useSearchParams in the register page — that pattern is entangled with
      // the SSR-bailout fix, so it must not be "cleaned up" casually.
      '@typescript-eslint/no-require-imports': 'warn',
    },
  },
];

export default eslintConfig;
