
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 使用相對路徑，這樣無論部屬在網域根目錄或子目錄 (如 GitHub Pages) 都能運作
  base: './', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.FIREBASE_CONFIG': JSON.stringify(process.env.FIREBASE_CONFIG || '{}'),
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        // 確保打包出的檔案名稱在某些環境下不會因路徑出錯
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-utils': ['recharts', '@google/genai'],
        },
      },
    },
  },
});
