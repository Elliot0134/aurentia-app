// vite.config.ts
import { defineConfig } from "file:///Users/elliotestrade/Desktop/Documents/03.%20ESST-SOLUTIONS/Coding/aurentia-app-feature-chatbot/node_modules/vite/dist/node/index.js";
import react from "file:///Users/elliotestrade/Desktop/Documents/03.%20ESST-SOLUTIONS/Coding/aurentia-app-feature-chatbot/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///Users/elliotestrade/Desktop/Documents/03.%20ESST-SOLUTIONS/Coding/aurentia-app-feature-chatbot/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/elliotestrade/Desktop/Documents/03. ESST-SOLUTIONS/Coding/aurentia-app-feature-chatbot";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    chunkSizeWarningLimit: 5e3,
    // Set higher limit for feature-rich applications with many routes
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Charts library
          "charts-vendor": ["chart.js", "react-chartjs-2"],
          // Calendar library
          "calendar-vendor": ["@fullcalendar/core", "@fullcalendar/react", "@fullcalendar/daygrid", "@fullcalendar/timegrid", "@fullcalendar/interaction"],
          // Supabase
          "supabase-vendor": ["@supabase/supabase-js"],
          // UI libraries (Radix UI components)
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-label",
            "@radix-ui/react-switch",
            "@radix-ui/react-toast"
          ],
          // React Query
          "query-vendor": ["@tanstack/react-query"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZWxsaW90ZXN0cmFkZS9EZXNrdG9wL0RvY3VtZW50cy8wMy4gRVNTVC1TT0xVVElPTlMvQ29kaW5nL2F1cmVudGlhLWFwcC1mZWF0dXJlLWNoYXRib3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9lbGxpb3Rlc3RyYWRlL0Rlc2t0b3AvRG9jdW1lbnRzLzAzLiBFU1NULVNPTFVUSU9OUy9Db2RpbmcvYXVyZW50aWEtYXBwLWZlYXR1cmUtY2hhdGJvdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZWxsaW90ZXN0cmFkZS9EZXNrdG9wL0RvY3VtZW50cy8wMy4lMjBFU1NULVNPTFVUSU9OUy9Db2RpbmcvYXVyZW50aWEtYXBwLWZlYXR1cmUtY2hhdGJvdC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMDAsIC8vIFNldCBoaWdoZXIgbGltaXQgZm9yIGZlYXR1cmUtcmljaCBhcHBsaWNhdGlvbnMgd2l0aCBtYW55IHJvdXRlc1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAvLyBSZWFjdCBjb3JlXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcblxuICAgICAgICAgIC8vIENoYXJ0cyBsaWJyYXJ5XG4gICAgICAgICAgJ2NoYXJ0cy12ZW5kb3InOiBbJ2NoYXJ0LmpzJywgJ3JlYWN0LWNoYXJ0anMtMiddLFxuXG4gICAgICAgICAgLy8gQ2FsZW5kYXIgbGlicmFyeVxuICAgICAgICAgICdjYWxlbmRhci12ZW5kb3InOiBbJ0BmdWxsY2FsZW5kYXIvY29yZScsICdAZnVsbGNhbGVuZGFyL3JlYWN0JywgJ0BmdWxsY2FsZW5kYXIvZGF5Z3JpZCcsICdAZnVsbGNhbGVuZGFyL3RpbWVncmlkJywgJ0BmdWxsY2FsZW5kYXIvaW50ZXJhY3Rpb24nXSxcblxuICAgICAgICAgIC8vIFN1cGFiYXNlXG4gICAgICAgICAgJ3N1cGFiYXNlLXZlbmRvcic6IFsnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJ10sXG5cbiAgICAgICAgICAvLyBVSSBsaWJyYXJpZXMgKFJhZGl4IFVJIGNvbXBvbmVudHMpXG4gICAgICAgICAgJ3VpLXZlbmRvcic6IFtcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtZGlhbG9nJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCcsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LXRhYnMnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b29sdGlwJyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtcG9wb3ZlcicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWFjY29yZGlvbicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWF2YXRhcicsXG4gICAgICAgICAgICAnQHJhZGl4LXVpL3JlYWN0LWNoZWNrYm94JyxcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtbGFiZWwnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC1zd2l0Y2gnLFxuICAgICAgICAgICAgJ0ByYWRpeC11aS9yZWFjdC10b2FzdCcsXG4gICAgICAgICAgXSxcblxuICAgICAgICAgIC8vIFJlYWN0IFF1ZXJ5XG4gICAgICAgICAgJ3F1ZXJ5LXZlbmRvcic6IFsnQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5J10sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJjLFNBQVMsb0JBQW9CO0FBQ3hlLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLHVCQUF1QjtBQUFBO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUd6RCxpQkFBaUIsQ0FBQyxZQUFZLGlCQUFpQjtBQUFBO0FBQUEsVUFHL0MsbUJBQW1CLENBQUMsc0JBQXNCLHVCQUF1Qix5QkFBeUIsMEJBQTBCLDJCQUEyQjtBQUFBO0FBQUEsVUFHL0ksbUJBQW1CLENBQUMsdUJBQXVCO0FBQUE7QUFBQSxVQUczQyxhQUFhO0FBQUEsWUFDWDtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBO0FBQUEsVUFHQSxnQkFBZ0IsQ0FBQyx1QkFBdUI7QUFBQSxRQUMxQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
