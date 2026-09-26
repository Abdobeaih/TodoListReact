/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        include: ["@emotion/react", "@emotion/styled", "@mui/material"],
    },
    build: {
        rollupOptions: {
            output: {
                // Split vendor code so app updates do not invalidate the framework cache.
                manualChunks(id) {
                    if (!id.includes("node_modules")) return undefined;
                    if (/node_modules[\\/](@mui|@emotion)[\\/]/.test(id)) return "mui";
                    if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
                        return "react";
                    return undefined;
                },
            },
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: false,
        restoreMocks: true,
        // MUI dialogs and transitions are slow under jsdom, and v8 coverage makes
        // every render more expensive, so the 5s default is far too tight.
        testTimeout: 30_000,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/test/**", "src/main.tsx"],
        },
    },
});
