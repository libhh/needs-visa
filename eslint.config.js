import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/", "dist/"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
