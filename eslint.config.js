import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import security from "eslint-plugin-security";
import perfectionist from "eslint-plugin-perfectionist";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/**", "dist"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  security.configs.recommended,
  {
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { perfectionist },
    rules: {
      "perfectionist/sort-imports": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-exports": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-object-types": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
      "perfectionist/sort-jsx-props": ["warn", { type: "natural", order: "asc", ignoreCase: true }],
    },
  },
]);
