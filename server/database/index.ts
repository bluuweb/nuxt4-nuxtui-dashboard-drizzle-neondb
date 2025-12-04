import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env" }); // or .env.local

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
