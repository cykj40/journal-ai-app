const required = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
] as const

export function validateEnv() {
    const missing: string[] = []

    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key)
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nSee .env.example for setup instructions.`
        )
    }
}
