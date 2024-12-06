import type { User } from '@clerk/nextjs/api'
import { db } from './db'
import { auth } from '@clerk/nextjs/server'
import { users, accounts } from './schema'
import { eq } from 'drizzle-orm'

export const getUserFromClerkID = async () => {
    const { userId } = auth()

    if (!userId) {
        throw new Error('No user ID found')
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))

    if (!user) {
        throw new Error('User not found')
    }

    return user
}

export const syncNewUser = async (clerkUser: User) => {
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))

    if (!existingUser) {
        const email = clerkUser.emailAddresses[0].emailAddress

        // Insert new user
        const [newUser] = await db
            .insert(users)
            .values({
                clerkId: clerkUser.id,
                email,
                name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName}` : null,
            })
            .returning()

        // Create associated account
        await db
            .insert(accounts)
            .values({
                userId: newUser.id,
                // Add any additional account fields here
            })
    }
}