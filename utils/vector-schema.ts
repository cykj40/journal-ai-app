import { pgTable, text, vector } from 'drizzle-orm/pg-core';
import { journalEntries } from './schema';

export const vectorEntries = pgTable('vector_entries', {
    id: text('id').primaryKey(),
    entryId: text('entry_id').references(() => journalEntries.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 256 }).notNull(),
});