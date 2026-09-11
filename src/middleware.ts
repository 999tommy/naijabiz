import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Root/apex hostnames that should NOT be treated as subdomains ──────────────
const ROOT_HOSTNAMES = new Set([
    'qriblo.com',
    'www.qriblo.com',
    // Local development variants
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
])

function getSubdomain(hostname: string): string | null {
    // Strip port if present
    const host = hostname.split(':')[0]

    // Check root domains (exact match)
    if (ROOT_HOSTNAMES.has(hostname) || ROOT_HOSTNAMES.has(host)) return null

    // Production: mybrand.qriblo.com → "mybrand"
    if (host.endsWith('.qriblo.com')) {
        const sub = host.replace('.qriblo.com', '')
        return sub || null
    }

    // Local dev: mybrand.localhost → "mybrand"
    if (host.endsWith('.localhost')) {
        const sub = host.replace('.localhost', '')
        return sub || null
    }

    return null
}

export async function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''

    // ── REDIRECT DOMAIN ──────────────────────────────────────────────────────
    if (hostname.includes('naijabiz.org')) {
        const url = request.nextUrl.clone()
        url.hostname = 'qriblo.com'
        // If they hit naijabiz.org:3000, ensure it redirects to https://qriblo.com standard port in prod
        url.port = ''
        url.protocol = 'https:'
        return NextResponse.redirect(url, 301)
    }

    const subdomain = getSubdomain(hostname)

    // ── SUBDOMAIN ROUTING ────────────────────────────────────────────────────
    // If a valid subdomain is detected, rewrite to the /{slug} path
    // which hits the existing src/app/[slug]/page.tsx — no new folder needed.
    // e.g. tolas-kitchen.qriblo.com/       → /tolas-kitchen
    //      tolas-kitchen.qriblo.com/review  → /tolas-kitchen/review
    if (subdomain) {
        const url = request.nextUrl.clone()
        const currentPath = url.pathname === '/' ? '' : url.pathname
        url.pathname = `/${subdomain}${currentPath}`
        return NextResponse.rewrite(url)
    }

    // ── SUPABASE AUTH (unchanged from original) ──────────────────────────────
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes - redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // Redirect authenticated users away from auth pages
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        // Allow access to signup if it's the business onboarding step
        if (request.nextUrl.searchParams.get('step') === 'business') {
            return supabaseResponse
        }

        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|herexcellence).*)',
    ],
}
