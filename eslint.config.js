import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginImport from "eslint-plugin-import"
import eslintPluginReactHooks from "eslint-plugin-react-hooks";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {jsx: true},
        project: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
  },
  {languageOptions: {globals: globals.browser}},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  pluginReactConfig,
  {settings: {react: {version: "detect"}}},
  eslintPluginPrettierRecommended,
  {
    plugins: {'import': eslintPluginImport},

    rules: {
      // analysis/correctness
      'import/named': 'error',
      'import/default': 'error',
      'import/export': 'error',

      // red flags (thus, warnings)
      'import/no-named-as-default': 'warn',
      'import/no-named-as-default-member': 'warn',
      'import/no-duplicates': 'warn',

      "import/no-useless-path-segments": "warn",

      // broken right now
      /*
                  "import/no-unused-modules": [
                      "warn",
                      {
                          "unusedExports": true,
                          "ignoreExports": ["**!/__mocks__/!**", "**!/!*.test.ts"]
                      }
                  ],
      */

      "import/order": [
        "warn",
        {
          "alphabetize": {
            "order": "asc",
            "caseInsensitive": true
          },
          "groups": [["builtin", "external"], "parent", "sibling", "index"]
        }
      ],
    },

    languageOptions: {
      // need all these for parsing dependencies (even if _your_ code doesn't need
      // all of them)
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018,
      },
    },
  },
  {
    plugins: {
      "react-hooks": eslintPluginReactHooks,
    },
    rules: {
      "@typescript-eslint/array-type": ["warn", {"default": "array-simple"}],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ],
      "arrow-body-style": "warn",
      "no-console": "warn",
      "no-unused-vars": "warn",
      "prettier/prettier": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          "enableDangerousAutofixThisMayCauseInfiniteLoops": true
        }
      ],
      "react-hooks/rules-of-hooks": "error",
    },
  }
];
