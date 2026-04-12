import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { nextCookies } from 'better-auth/next-js'
import { db } from './db'
import * as betterAuthSchema from '../utils/better-auth-schema'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: betterAuthSchema,
  }),
  plugins: [nextCookies()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
})

export type Auth = typeof auth
