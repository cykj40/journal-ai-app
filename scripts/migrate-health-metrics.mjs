import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const sql = neon(process.env.DATABASE_URL)

const query = `
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Mental / cognitive
    mood_stability TEXT,
    anxiety_level TEXT,
    motivation_level TEXT,
    gratitude_mentioned BOOLEAN DEFAULT FALSE,
    social_connection TEXT,

    -- Energy & stress
    energy_level TEXT,
    stress_level TEXT,
    work_stress BOOLEAN DEFAULT FALSE,
    work_stress_severity TEXT,

    -- Sleep
    sleep_quality TEXT,

    -- Exercise
    exercise_mentioned BOOLEAN DEFAULT FALSE,
    exercise_type TEXT,
    exercise_duration TEXT,
    exercise_intensity TEXT,
    stretching_mobility BOOLEAN DEFAULT FALSE,
    rest_day_mentioned BOOLEAN DEFAULT FALSE,

    -- Nutrition
    nutrition_mentioned BOOLEAN DEFAULT FALSE,
    nutrition_summary TEXT,
    food_logged TEXT,
    water_intake TEXT,
    alcohol_mentioned BOOLEAN DEFAULT FALSE,
    caffeine_noted BOOLEAN DEFAULT FALSE,

    -- Physical
    physical_symptoms TEXT,
    pain_level TEXT,
    pain_location TEXT,
    heart_rate_noted BOOLEAN DEFAULT FALSE,
    digestion_noted BOOLEAN DEFAULT FALSE,
    digestion_notes TEXT,
    skin_noted BOOLEAN DEFAULT FALSE,
    cycle_noted BOOLEAN DEFAULT FALSE,

    -- Environment & recovery
    sun_exposure BOOLEAN DEFAULT FALSE,
    outdoor_time BOOLEAN DEFAULT FALSE,
    cold_exposure BOOLEAN DEFAULT FALSE,
    breathwork_meditation BOOLEAN DEFAULT FALSE,
    travel_mentioned BOOLEAN DEFAULT FALSE,
    natural_environment BOOLEAN DEFAULT FALSE,
    screen_time_noted BOOLEAN DEFAULT FALSE,

    -- Medications & flags
    medications_mentioned TEXT,
    health_flags TEXT,
    raw_extraction TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`

try {
    await sql(query)
    console.log('✓ health_metrics table created (or already exists)')
} catch (err) {
    console.error('Migration failed:', err.message)
    process.exit(1)
}
