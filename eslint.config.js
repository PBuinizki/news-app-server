import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    plugins: {
      import: importPlugin,
      jsdoc: jsdoc,
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
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          returns: "returns",
            route: 'route',
            fileoverview: 'fileoverview',
            version: 'version',
            author: 'author',
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
    ignores: [
      "node_modules/",
      "uploads/",
      "dist/",
      "coverage/",
      "*.log",
      ".DS_Store",
      "eslint.config.js",
    ],
  },
];