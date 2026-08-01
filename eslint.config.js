import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import nodePlugin from "eslint-plugin-node";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      jsdoc: jsdoc,
      node: nodePlugin,
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      curly: "error",
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "jsdoc/check-alignment": "warn",
      "jsdoc/check-param-names": "error",
      "jsdoc/check-tag-names": "error",
      "jsdoc/check-types": "warn",
      "jsdoc/newline-after-description": "warn",
      "jsdoc/require-param": "error",
      "jsdoc/require-param-type": "error",
      "jsdoc/require-returns": "error",
      "jsdoc/require-returns-type": "error",
      "jsdoc/require-jsdoc": [
        "error",
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: true,
          },
        },
      ],
      "node/exports-style": ["error", "module.exports"],
      "node/prefer-global/buffer": ["error", "always"],
      "node/prefer-global/console": ["error", "always"],
      "node/prefer-global/process": ["error", "always"],
      "node/prefer-global/url-search-params": ["error", "always"],
      "node/prefer-global/url": ["error", "always"],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          returns: "returns",
        },
        preferredTypes: {
          Object: "object",
          String: "string",
          Number: "number",
          Boolean: "boolean",
          Array: "array",
          Function: "function",
        },
      },
    },
  },
  {
    ignores: ["node_modules/", "uploads/", "dist/", "coverage/", "*.log", ".DS_Store"],
  },
];