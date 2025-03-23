// import { FlatCompat } from '@eslint/eslintrc';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   ...compat.extends(
//     'next/core-web-vitals',
//     'next',
//     'next/typescript',
//     'prettier',
//   ),
// ];

// export default eslintConfig;

import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = dirname(globalThis.__filename);

const compat = new FlatCompat({
  baseDirectory: globalThis.__dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next',
    'next/typescript',
    'prettier'
  ),
];

export default eslintConfig;
