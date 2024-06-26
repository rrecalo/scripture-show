import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  build:{
    rollupOptions:{
        input:{
            main: './index.html',
            monitor: './monitor.html',
            configure_screens: './configure_screens.html',
            bookmark: './bookmark.html',
            projection_customization: './projection_customization.html'
        }
    }
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  }
}));
