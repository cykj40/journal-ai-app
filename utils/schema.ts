import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const journalEntryStatusEnum = pgEnum('journal_entry_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const accounts = pgTable('accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
})

export const journalEntries = pgTable('journal_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id),
    content: text('content').notNull(),
    status: journalEntryStatusEnum('status').default('DRAFT'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const entryAnalysis = pgTable('entry_analysis', {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id),
    mood: text('mood').notNull(),
    subject: text('subject').notNull(),
    negative: boolean('negative').notNull(),
    summary: text('summary').notNull(),
    color: text('color').default('#0101fe'),
    sentimentScore: text('sentiment_score').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})