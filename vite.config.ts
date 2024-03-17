import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        icon: "https://treehole.pku.edu.cn/web/favicon.ico",
        namespace: "xiaotianxt/fxxk-tree-hole",
        match: ["*://treehole.pku.edu.cn/web/*"],
        "run-at": "document-start",
      },
    }),
  ],
});
