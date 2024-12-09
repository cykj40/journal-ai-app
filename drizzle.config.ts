import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
    dialect: "postgresql",
    schema: "./utils/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!, // Use 'url' instead of 'connectionString'
    },
});

