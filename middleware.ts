import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboardRoute = createRouteMatcher(['/journal(.*)'])

export default clerkMiddleware(async (auth, req) => {
    if (isDashboardRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        "/((?!.*\\..*|_next).*)",
        // Optional: Allow images and other static files
        "/(api|trpc)(.*)",
    ],
}
