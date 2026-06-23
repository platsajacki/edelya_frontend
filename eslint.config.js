import js from "@eslint/js"
import ts from "typescript-eslint"
import prettier from "eslint-config-prettier"
import vue from "eslint-plugin-vue"

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs["flat/recommended"],
  prettier,
  {
    rules: {
      "no-undef": "off",
      "vue/multi-word-component-names": "off",
      "no-irregular-whitespace": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
]
