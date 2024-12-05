import { pgTable, text, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';

// Define the enum for journal entry status
export const journalEntryStatus = pgEnum('journal_entry_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

// Define the users table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    clerkId: text('clerk_id').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the accounts table
export const accounts = pgTable('accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id),
});

// Define the journal entries table
export const journalEntries = pgTable('journal_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    content: text('content').notNull(),
    status: journalEntryStatus('status').default('DRAFT'),
});

// Define the entry analysis table
export const entryAnalysis = pgTable('entry_analysis', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    entryId: text('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mood: text('mood').notNull(),
    subject: text('subject').notNull(),
    negative: boolean('negative').notNull(),
    summary: text('summary').notNull(),
    color: text('color').default('#0101fe'),
    sentimentScore: text('sentiment_score').notNull(),
});

