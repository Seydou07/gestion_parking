import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('fleet_token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Redirection intelligente de la racine (/)
    if (pathname === '/') {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Protection des routes privées (Dashboard et modules)
    // On définit les routes sensibles
    const isProtectedRoute = 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/vehicles') ||
        pathname.startsWith('/drivers') ||
        pathname.startsWith('/missions') ||
        pathname.startsWith('/fuel') ||
        pathname.startsWith('/maintenance') ||
        pathname.startsWith('/history') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/budget') ||
        pathname.startsWith('/settings');

    if (isProtectedRoute && !token) {
        console.log(`🔒 [Middleware] Unauthorized access to ${pathname}, redirecting to /login`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Prévention des doubles logins (Rediriger si déjà connecté)
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Configuration du matcher pour inclure toutes les routes métier
export const config = {
    matcher: [
        /*
         * Matcher toutes les routes sauf :
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - logo.png, etc. (public assets)
         */
        '/',
        '/login',
        '/dashboard/:path*',
        '/vehicles/:path*',
        '/drivers/:path*',
        '/missions/:path*',
        '/fuel/:path*',
        '/maintenance/:path*',
        '/history/:path*',
        '/users/:path*',
        '/budget/:path*',
        '/settings/:path*',
    ],
};
