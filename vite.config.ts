import svgr from "vite-plugin-svgr"
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import browserslistToEsbuild from "browserslist-to-esbuild";
import checker from "vite-plugin-checker";

export default defineConfig({
    base: "",
    build: {
        target: browserslistToEsbuild(
            [
                ">0.2%",
                "not dead",
                "not op_mini all",
            ]
        ),
    },
    plugins: [
        react(),
        svgr(),
        checker({
            // typescript: true,
            eslint: {
                lintCommand: `eslint "./src/**/*.{ts,tsx}" --max-warnings 0`,
                useFlatConfig: true,
            },
        })
    ],
    server: {
        open: true,
        port: 3152,
    },
})
