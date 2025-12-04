import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

export default defineConfig({
  schema: "./server/database/schema.ts",
  out: "./server/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
