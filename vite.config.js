import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json' assert {type: 'json'}

manifest.version = process.env.GITHUB_REF || process.env.npm_package_version
import tailwindcss from 'tailwindcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), crx({manifest}), tailwindcss()],
})
