import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/utils/db';
import { users } from '@/utils/schema';

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env');
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
    }

    const payload = await req.json();
    const webhook = new Webhook(WEBHOOK_SECRET);

    try {
        const evt = webhook.verify(JSON.stringify(payload), {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;

        if (evt.type === 'user.created' || evt.type === 'user.updated') {
            await db.insert(users).values({
                id: evt.data.id,
                email: evt.data.email_addresses[0].email_address,
                clerkId: evt.data.id,
                name: evt.data.first_name ? `${evt.data.first_name} ${evt.data.last_name}` : null
            }).onConflictDoUpdate({
                target: users.id,
                set: {
                    email: evt.data.email_addresses[0].email_address,
                    name: evt.data.first_name ? `${evt.data.first_name} ${evt.data.last_name}` : null,
                    updatedAt: new Date(),
                },
            });
        }

        return new Response('', { status: 200 });
    } catch (err) {
        console.error('Error:', err);
        return new Response('Error occured', {
            status: 400
        });
    }
}