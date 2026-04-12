import { db } from './db'
import { auth } from '@/lib/auth'
import { users, accounts } from './schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

type SessionUser = {
    id: string
    email: string
    name: string
}

export const getCurrentAppUser = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user) {
        throw new Error('No user ID found')
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.authUserId, session.user.id))

    if (!user) {
        await syncNewUser(session.user)
        const [newUser] = await db
            .select()
            .from(users)
            .where(eq(users.authUserId, session.user.id))

        if (!newUser) {
            throw new Error('Failed to create user')
        }

        return newUser
    }

    return user
}

export const syncNewUser = async (authUser: SessionUser) => {
    const [existingByAuthId] = await db
        .select()
        .from(users)
        .where(eq(users.authUserId, authUser.id))

    if (existingByAuthId) return

    const [existingByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, authUser.email))

    if (existingByEmail) {
        await db
            .update(users)
            .set({
                authUserId: authUser.id,
                name: authUser.name || existingByEmail.name,
                updatedAt: new Date(),
            })
            .where(eq(users.id, existingByEmail.id))
        return
    }

    const [newUser] = await db
        .insert(users)
        .values({
            authUserId: authUser.id,
            email: authUser.email,
            name: authUser.name || null,
        })
        .returning()

    await db
        .insert(accounts)
        .values({
            userId: newUser.id,
        })
}
