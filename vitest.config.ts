import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: [
      "src/**/*.test.{ts,tsx}",
      "tests/unit/**/*.test.{ts,tsx}",
      // 실제 Supabase가 필요하며, 환경변수가 없으면 테스트가 스스로 skip한다.
      "tests/integration/**/*.test.{ts,tsx}",
    ],
    exclude: ["**/node_modules/**", "tests/e2e/**", "e2e/**"],
    passWithNoTests: true,
  },
});
