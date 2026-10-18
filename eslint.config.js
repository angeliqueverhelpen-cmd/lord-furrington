import js from "@eslint/js";
import globals from "globals";
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
    ...js.configs.recommended,
  },
];
