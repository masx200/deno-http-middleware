import { defineConfig } from "rollup";
import { httpResolve } from "@masx200/rollup-plugin-http-resolve";
import json from "@rollup/plugin-json";
import { minify } from "rollup-plugin-swc-minify";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";

export default defineConfig([
    {
        external: ["@hattip/response"],
        input: "./index.ts",
        output: {
            file: "./dist/index.js",
            format: "esm",
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            httpResolve(),
            ts({
                transpileOnly: true,
                transpiler: "swc",
                /* Plugin options */
            }),
            json(),

            // dts(),
            minify(),
        ],
    },
]);
