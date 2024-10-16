import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',  // Ensure this is correct for AWS Amplify
  build: {
    outDir: 'dist',
  },
});
