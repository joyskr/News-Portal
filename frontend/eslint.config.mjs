import nextPlugin from '@next/eslint-plugin-next';

const config = [
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    ignores: ['.next/**', 'next-env.d.ts'],
  },
];

export default config;
