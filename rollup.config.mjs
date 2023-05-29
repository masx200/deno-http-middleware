import { fileCache, httpResolve } from "@masx200/rollup-plugin-http-resolve";

import { defineConfig } from "rollup";
import json from "@rollup/plugin-json";
import { minify } from "rollup-plugin-swc-minify";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";

export default defineConfig([
    {
        external: ["@hattip/response"],
        input: "./mod.ts",
        output: {
            file: "./dist/index.js",
            format: "esm",
            sourcemap: true,
        },
        plugins: [
            nodeResolve(),
            httpResolve({ cache: new fileCache() }),
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
