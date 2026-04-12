import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTE_PREFIXES = ['/sign-in', '/sign-up', '/login', '/signup', '/api/auth']
const PUBLIC_ROUTE_EXACT = new Set(['/'])

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const isPublic =
        PUBLIC_ROUTE_EXACT.has(pathname) ||
        PUBLIC_ROUTE_PREFIXES.some((route) => pathname.startsWith(route))

    if (isPublic) {
        return NextResponse.next()
    }

    const sessionResponse = await fetch(new URL('/api/auth/get-session', req.url), {
        headers: req.headers,
        cache: 'no-store',
    })

    const session = sessionResponse.ok ? await sessionResponse.json() : null

    if (!session) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!.*\\..*|_next).*)",
        "/(api|trpc)(.*)",
    ],
}
