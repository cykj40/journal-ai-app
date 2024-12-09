import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/utils/db'
import { users, accounts } from '@/utils/schema'
import { eq } from 'drizzle-orm'

const createNewUser = async () => {
    const user = await currentUser()

    if (!user) {
        throw new Error('No user found')
    }

    // Check if user exists
    const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, user.id))

    if (!existingUser) {
        // Create new user
        const [newUser] = await db
            .insert(users)
            .values({
                email: user.emailAddresses[0].emailAddress,
                clerkId: user.id,
                name: user.firstName ? `${user.firstName} ${user.lastName}` : null,
            })
            .returning()

        // Create associated account
        await db
            .insert(accounts)
            .values({
                userId: newUser.id,
            })
    }

    redirect('/journal')
}

const NewUser = async () => {
    await createNewUser()
    return <div>...loading</div>
}

export default NewUser
