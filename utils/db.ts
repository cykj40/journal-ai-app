import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Define global type for database client
const globalForDb = globalThis as unknown as {
    db: ReturnType<typeof drizzle> | undefined;
};

// Create db connection if it doesn't exist
const sql = neon(process.env.DATABASE_URL!);
export const db = globalForDb.db ?? drizzle(sql, { schema });

// In development, save the connection to avoid duplicates
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;