import { pgTable, uuid, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const journalEntryStatusEnum = pgEnum('journal_entry_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED'])

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    authUserId: text('auth_user_id').notNull().unique(),
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
    healthSnapshot: text('health_snapshot'),
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
    balanceScore: text('balance_score'),
    coachingInsight: text('coaching_insight'),
    coachingRecommendation: text('coaching_recommendation'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const healthMetrics = pgTable('health_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    entryId: uuid('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull().defaultNow(),

    // Mental / cognitive
    moodStability: text('mood_stability'),
    anxietyLevel: text('anxiety_level'),
    motivationLevel: text('motivation_level'),
    gratitudeMentioned: boolean('gratitude_mentioned').default(false),
    socialConnection: text('social_connection'),

    // Energy & stress
    energyLevel: text('energy_level'),
    stressLevel: text('stress_level'),
    workStress: boolean('work_stress').default(false),
    workStressSeverity: text('work_stress_severity'),

    // Sleep
    sleepQuality: text('sleep_quality'),

    // Exercise
    exerciseMentioned: boolean('exercise_mentioned').default(false),
    exerciseType: text('exercise_type'),
    exerciseDuration: text('exercise_duration'),
    exerciseIntensity: text('exercise_intensity'),
    stretchingMobility: boolean('stretching_mobility').default(false),
    restDayMentioned: boolean('rest_day_mentioned').default(false),

    // Nutrition
    nutritionMentioned: boolean('nutrition_mentioned').default(false),
    nutritionSummary: text('nutrition_summary'),
    foodLogged: text('food_logged'),           // JSON array stored as text
    waterIntake: text('water_intake'),
    alcoholMentioned: boolean('alcohol_mentioned').default(false),
    caffeineNoted: boolean('caffeine_noted').default(false),

    // Physical
    physicalSymptoms: text('physical_symptoms'),  // JSON array as text
    painLevel: text('pain_level'),
    painLocation: text('pain_location'),          // JSON array as text
    heartRateNoted: boolean('heart_rate_noted').default(false),
    digestionNoted: boolean('digestion_noted').default(false),
    digestionNotes: text('digestion_notes'),
    skinNoted: boolean('skin_noted').default(false),
    cycleNoted: boolean('cycle_noted').default(false),

    // Environment & recovery
    sunExposure: boolean('sun_exposure').default(false),
    outdoorTime: boolean('outdoor_time').default(false),
    coldExposure: boolean('cold_exposure').default(false),
    breathworkMeditation: boolean('breathwork_meditation').default(false),
    travelMentioned: boolean('travel_mentioned').default(false),
    naturalEnvironment: boolean('natural_environment').default(false),
    screenTimeNoted: boolean('screen_time_noted').default(false),

    // Medications
    medicationsMentioned: text('medications_mentioned'),  // JSON array as text

    // Flags
    healthFlags: text('health_flags'),  // JSON array as text

    // Raw backup — always store full AI response for reprocessing
    rawExtraction: text('raw_extraction'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
})
