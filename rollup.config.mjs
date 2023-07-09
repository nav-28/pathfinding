import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/main.ts",
  output: {
    name: "bundle",
    file: "public/bundle.js",
    format: "iife",
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};
