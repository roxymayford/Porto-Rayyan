import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: ['dist', 'node_modules', 'legacy', 'tests/e2e/__baseline__', '.agents'],
  }
);
