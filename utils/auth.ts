import type { User } from '@clerk/nextjs/server'
import { db } from './db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { users, accounts } from './schema'
import { eq } from 'drizzle-orm'

export const getUserFromClerkID = async () => {
    const { userId } = await auth()

    if (!userId) {
        throw new Error('No user ID found')
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId))

    if (!user) {
        // Get the user data from Clerk
        const clerkUser = await (await clerkClient()).users.getUser(userId)
        // Sync the user to our database
        await syncNewUser(clerkUser)
        // Try to get the user again
        const [newUser] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))

        if (!newUser) {
            throw new Error('Failed to create user')
        }

        return newUser
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