import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['src/**/*.js', '*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
