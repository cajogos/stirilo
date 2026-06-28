import js from "@eslint/js";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
      "**/next-env.d.ts",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "@stylistic": stylistic },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@stylistic/semi": ["error", "always"],
      "@stylistic/brace-style": ["error", "allman", { allowSingleLine: false }],
    },
  },
  {
    // The scanner is metadata-only: forbid any file-content read API in its
    // source (tests use vi.spyOn via a namespace import, which is unaffected).
    files: ["packages/scanner/src/**/*.ts"],
    ignores: ["packages/scanner/src/**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "node:fs",
              importNames: [
                "readFile",
                "readFileSync",
                "open",
                "openSync",
                "read",
                "readSync",
                "createReadStream",
              ],
              message: "Scanner is metadata-only; it must not read file contents.",
            },
            {
              name: "node:fs/promises",
              importNames: ["readFile", "open"],
              message: "Scanner is metadata-only; it must not read file contents.",
            },
          ],
        },
      ],
    },
  },
);
