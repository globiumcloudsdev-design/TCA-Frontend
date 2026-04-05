// // /**
// //  * Next.js Edge Middleware — Route Protection
// //  *
// //  * Rules:
// //  *  - Unauthenticated → redirect to /login
// //  *  - Authenticated  → redirect away from /login to /dashboard
// //  *  - /master-admin/* is ONLY accessible if role_code === 'MASTER_ADMIN'
// //  */
// // import { NextResponse } from 'next/server';

// // const PUBLIC_PATHS = ['/', '/login', '/portal-login', '/forgot-password', '/reset-password'];

// // // Portal route prefixes (must use trailing /  to avoid matching /students, /teachers)
// // const PARENT_PATHS  = ['/parent/'];
// // const STUDENT_PATHS = ['/student/'];
// // const TEACHER_PATHS = ['/teacher/'];

// // // Institute-type admin route prefixes — all require access_token + matching institute_type cookie
// // const INSTITUTE_PREFIXES = ['/school/', '/coaching/', '/academy/', '/college/', '/university/'];

// // // Map institute_type cookie value → allowed route prefix
// // const INSTITUTE_ROUTE_MAP = {
// //   school:     '/school/',
// //   coaching:   '/coaching/',
// //   academy:    '/academy/',
// //   college:    '/college/',
// //   university: '/university/',
// // };

// // export function middleware(request) {
// //   const { pathname } = request.nextUrl;

// //   // Allow static assets + Next internals
// //   if (
// //     pathname.startsWith('/_next') ||
// //     pathname.startsWith('/api') ||
// //     pathname.includes('.')
// //   ) {
// //     return NextResponse.next();
// //   }

// //   // ── Portal route guards ─────────────────────────────────────────
// //   // Match /parent/*, /student/*, /teacher/* but NOT /parents, /students, /teachers (staff management)
// //   const isParentRoute  = PARENT_PATHS.some((p) => pathname.startsWith(p));
// //   const isStudentRoute = STUDENT_PATHS.some((p) => pathname.startsWith(p));
// //   const isTeacherRoute = TEACHER_PATHS.some((p) => pathname.startsWith(p));

// //   if (isParentRoute || isStudentRoute || isTeacherRoute) {
// //     const portalToken = request.cookies.get('portal_token')?.value;
// //     const portalType  = request.cookies.get('portal_type')?.value;

// //     if (!portalToken) {
// //       // Not logged in to portal → redirect to portal login
// //       const url = request.nextUrl.clone();
// //       url.pathname = '/portal-login';
// //       return NextResponse.redirect(url);
// //     }

// //     // Wrong portal type guard (parent trying to access /student and vice versa)
// //     if (isParentRoute  && portalType !== 'PARENT') {
// //       const url = request.nextUrl.clone();
// //       url.pathname = '/portal-login';
// //       return NextResponse.redirect(url);
// //     }
// //     if (isStudentRoute && portalType !== 'STUDENT') {
// //       const url = request.nextUrl.clone();
// //       url.pathname = '/portal-login';
// //       return NextResponse.redirect(url);
// //     }
// //     if (isTeacherRoute && portalType !== 'TEACHER') {
// //       const url = request.nextUrl.clone();
// //       url.pathname = '/portal-login';
// //       return NextResponse.redirect(url);
// //     }

// //     return NextResponse.next();
// //   }
// //   // ────────────────────────────────────────────────────────────────

// //   const token = request.cookies.get('access_token')?.value;
// //   const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

// //   // Not authenticated → force login
// //   if (!token && !isPublic) {
// //     const url = request.nextUrl.clone();
// //     url.pathname = '/login';
// //     return NextResponse.redirect(url);
// //   }

// //   // Already authenticated → don't allow login page
// //   // Redirect to master-admin dashboard or institute-type dashboard
// //   if (token && (pathname === '/login')) {
// //     const roleCode      = request.cookies.get('role_code')?.value;
// //     const instituteType = request.cookies.get('institute_type')?.value;
// //     const PATHS = {
// //       school:     '/school/dashboard',
// //       coaching:   '/coaching/dashboard',
// //       academy:    '/academy/dashboard',
// //       college:    '/college/dashboard',
// //       university: '/university/dashboard',
// //     };
// //     const url = request.nextUrl.clone();
// //     if (roleCode === 'MASTER_ADMIN') {
// //       url.pathname = '/master-admin';
// //     } else {
// //       url.pathname = PATHS[instituteType] ?? '/dashboard';
// //     }
// //     return NextResponse.redirect(url);
// //   }

// //   // Institute-type route guard
// //   // e.g. a 'school' admin trying to access /coaching/* should be redirected
// //   const matchedPrefix = INSTITUTE_PREFIXES.find((p) => pathname.startsWith(p));
// //   if (matchedPrefix && token) {
// //     const instituteType = request.cookies.get('institute_type')?.value;
// //     const roleCode      = request.cookies.get('role_code')?.value;
// //     // MASTER_ADMIN can access any institute route
// //     if (roleCode !== 'MASTER_ADMIN' && instituteType) {
// //       const allowedPrefix = INSTITUTE_ROUTE_MAP[instituteType];
// //       if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
// //         const url = request.nextUrl.clone();
// //         url.pathname = INSTITUTE_ROUTE_MAP[instituteType] + 'dashboard';
// //         return NextResponse.redirect(url);
// //       }
// //     }
// //   }

// //   // Master Admin guard — only allow MASTER_ADMIN role on /master-admin/*
// //   // NOTE: We use a custom header set by the login flow, not JWT decode here
// //   // (edge runtime can't run heavy crypto). Instead we rely on the API to
// //   // reject unauthorized calls. We still redirect based on the stored cookie
// //   // 'role_code' that the client sets as a plain (non-httpOnly) cookie.
// //   if (pathname.startsWith('/master-admin')) {
// //     const roleCode = request.cookies.get('role_code')?.value;
// //     if (roleCode !== 'MASTER_ADMIN') {
// //       const url = request.nextUrl.clone();
// //       url.pathname = '/dashboard';
// //       return NextResponse.redirect(url);
// //     }
// //   }

// //   return NextResponse.next();
// // }

// // export const config = {
// //   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// // };



// // frontend/src/middleware.js (FIXED - Token Priority)

// import { NextResponse } from 'next/server';

// // Public paths
// const PUBLIC_PATHS = ['/', '/login', '/portal-login', '/forgot-password', '/reset-password/', '/contact', '/about', '/features', '/stats', '/faq', '/pricing'];

// // Portal route prefixes
// const PORTAL_PATHS = {
//   PARENT: '/parent/',
//   STUDENT: '/student/',
//   TEACHER: '/teacher/',
// };

// // Institute routes
// const INSTITUTE_PREFIXES = ['/school/', '/coaching/', '/academy/', '/college/', '/university/'];

// const INSTITUTE_ROUTE_MAP = {
//   school: '/school/',
//   coaching: '/coaching/',
//   academy: '/academy/',
//   college: '/college/',
//   university: '/university/',
//   tution_center: '/tution-center/',
// };

// const DASHBOARD_PATHS = {
//   MASTER_ADMIN: '/master-admin',
//   STUDENT: '/student/dashboard',
//   PARENT: '/parent/dashboard',
//   TEACHER: '/teacher/dashboard',
// };

// const INSTITUTE_DASHBOARD = {
//   school: '/school/dashboard',
//   coaching: '/coaching/dashboard',
//   academy: '/academy/dashboard',
//   college: '/college/dashboard',
//   university: '/university/dashboard',
// };

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Allow static assets
//   if (
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/api') ||
//     pathname.includes('.')
//   ) {
//     return NextResponse.next();
//   }

//   // Get cookies
//   const portalToken = request.cookies.get('portal_token')?.value;
//   const accessToken = request.cookies.get('access_token')?.value;
//   const portalType = request.cookies.get('portal_type')?.value;
//   const userType = request.cookies.get('user_type')?.value;
//   const roleCode = request.cookies.get('role_code')?.value;
//   const instituteType = request.cookies.get('institute_type')?.value;

//   // ✅ PRIORITY: portal_token over access_token for portal routes
//   const isPortalRoute = pathname.startsWith('/parent/') || 
//                         pathname.startsWith('/student/') || 
//                         pathname.startsWith('/teacher/');
  
//   const isInstituteRoute = INSTITUTE_PREFIXES.some(p => pathname.startsWith(p));
//   const isMasterAdminRoute = pathname.startsWith('/master-admin');
//   const isPublicRoute = PUBLIC_PATHS.includes(pathname) || pathname === '/';

//   console.log('🔍 Middleware:', {
//     pathname,
//     hasPortalToken: !!portalToken,
//     hasAccessToken: !!accessToken,
//     portalType,
//     userType,
//     roleCode,
//     isPortalRoute,
//     isInstituteRoute
//   });

//   // ─────────────────────────────────────────────────────────────
//   // 1. PORTAL ROUTES - Use portal_token priority
//   // ─────────────────────────────────────────────────────────────
//   if (isPortalRoute) {
//     // If no portal_token, redirect to portal-login
//     if (!portalToken) {
//       const url = request.nextUrl.clone();
//       url.pathname = '/portal-login';
//       return NextResponse.redirect(url);
//     }

//     // Check if portal_type matches the route
//     if (portalType === 'STUDENT' && pathname.startsWith('/student/')) {
//       return NextResponse.next();
//     }
//     if (portalType === 'PARENT' && pathname.startsWith('/parent/')) {
//       return NextResponse.next();
//     }
//     if (portalType === 'TEACHER' && pathname.startsWith('/teacher/')) {
//       return NextResponse.next();
//     }

//     // Wrong portal type - redirect to correct portal
//     const correctPath = DASHBOARD_PATHS[portalType];
//     if (correctPath) {
//       const url = request.nextUrl.clone();
//       url.pathname = correctPath;
//       return NextResponse.redirect(url);
//     }
//   }

//   // ─────────────────────────────────────────────────────────────
//   // 2. INSTITUTE ROUTES - Use access_token
//   // ─────────────────────────────────────────────────────────────
//   if (isInstituteRoute) {
//     // If no access_token, redirect to login
//     if (!accessToken) {
//       const url = request.nextUrl.clone();
//       url.pathname = '/login';
//       return NextResponse.redirect(url);
//     }

//     // Get actual user type from cookie (should be INSTITUTE_ADMIN or STAFF)
//     const actualUserType = userType || roleCode;
    
//     // Portal users should not be in institute routes
//     if (actualUserType === 'STUDENT' || actualUserType === 'PARENT' || actualUserType === 'TEACHER') {
//       const portalPath = DASHBOARD_PATHS[actualUserType];
//       if (portalPath) {
//         const url = request.nextUrl.clone();
//         url.pathname = portalPath;
//         return NextResponse.redirect(url);
//       }
//     }

//     // Master Admin can access any institute route
//     if (roleCode === 'MASTER_ADMIN' || actualUserType === 'MASTER_ADMIN') {
//       return NextResponse.next();
//     }

//     // Institute Admin or Staff - check institute type
//     if (instituteType) {
//       const expectedPrefix = INSTITUTE_ROUTE_MAP[instituteType];
//       if (expectedPrefix && !pathname.startsWith(expectedPrefix)) {
//         const url = request.nextUrl.clone();
//         url.pathname = INSTITUTE_DASHBOARD[instituteType] || '/school/dashboard';
//         return NextResponse.redirect(url);
//       }
//     }

//     return NextResponse.next();
//   }

//   // ─────────────────────────────────────────────────────────────
//   // 3. MASTER ADMIN ROUTES
//   // ─────────────────────────────────────────────────────────────
//   if (isMasterAdminRoute) {
//     if (!accessToken) {
//       const url = request.nextUrl.clone();
//       url.pathname = '/login';
//       return NextResponse.redirect(url);
//     }

//     const isMasterAdmin = roleCode === 'MASTER_ADMIN' || userType === 'MASTER_ADMIN';
//     if (!isMasterAdmin) {
//       // Redirect to appropriate dashboard
//       const redirectPath = portalType ? DASHBOARD_PATHS[portalType] : 
//                           (instituteType ? INSTITUTE_DASHBOARD[instituteType] : '/login');
//       const url = request.nextUrl.clone();
//       url.pathname = redirectPath;
//       return NextResponse.redirect(url);
//     }

//     return NextResponse.next();
//   }

//   // ─────────────────────────────────────────────────────────────
//   // 4. PUBLIC PATHS
//   // ─────────────────────────────────────────────────────────────
//   if (isPublicRoute) {
//     // If user is authenticated, redirect to their dashboard
//     if (portalToken) {
//       const redirectPath = DASHBOARD_PATHS[portalType];
//       if (redirectPath && pathname !== redirectPath) {
//         const url = request.nextUrl.clone();
//         url.pathname = redirectPath;
//         return NextResponse.redirect(url);
//       }
//     }
    
//     if (accessToken && !portalToken) {
//       let redirectPath;
//       if (roleCode === 'MASTER_ADMIN' || userType === 'MASTER_ADMIN') {
//         redirectPath = '/master-admin';
//       } else if (userType === 'INSTITUTE_ADMIN' || userType === 'STAFF') {
//         redirectPath = INSTITUTE_DASHBOARD[instituteType] || '/school/dashboard';
//       }
      
//       if (redirectPath && pathname !== redirectPath && pathname !== '/portal-login') {
//         const url = request.nextUrl.clone();
//         url.pathname = redirectPath;
//         return NextResponse.redirect(url);
//       }
//     }
    
//     return NextResponse.next();
//   }

//   // ─────────────────────────────────────────────────────────────
//   // 5. NO AUTH - Redirect to login
//   // ─────────────────────────────────────────────────────────────
//   if (!portalToken && !accessToken) {
//     const url = request.nextUrl.clone();
//     url.pathname = '/login';
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
// };





// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const userType = request.cookies.get('user_type')?.value;
  const instituteType = request.cookies.get('institute_type')?.value;

  const institutePrefixes = ['/school', '/college', '/academy', '/coaching'];

  // =============================
  // 1️⃣ PUBLIC ROUTES (skip middleware)
  // =============================
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/portal-login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // =============================
  // 2️⃣ NOT LOGGED IN
  // =============================
  if (!accessToken) {
    // Allow public routes only
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // =============================
  // 3️⃣ MASTER ROLES (FREE)
  // =============================
  if (
    userType === 'MASTER_ADMIN' ||
    userType === 'MASTER_SUPPORT' ||
    userType === 'MASTER_STAFF'
  ) {
    return NextResponse.next();
  }

  // =============================
  // 4️⃣ PORTAL USERS: STUDENT / PARENT / TEACHER
  // =============================
  if (userType === 'STUDENT') {
    if (!pathname.startsWith('/student')) {
      return NextResponse.redirect(
        new URL('/student', request.url)
      );
    }
    return NextResponse.next();
  }

  if (userType === 'PARENT') {
    if (!pathname.startsWith('/parent')) {
      return NextResponse.redirect(
        new URL('/parent', request.url)
      );
    }
    return NextResponse.next();
  }

  if (userType === 'TEACHER') {
    if (!pathname.startsWith('/teacher')) {
      return NextResponse.redirect(
        new URL('/teacher', request.url)
      );
    }
    return NextResponse.next();
  }

  // =============================
  // 5️⃣ STAFF / INSTITUTE USERS
  // =============================
  if (userType === 'STAFF' || userType === 'INSTITUTE_ADMIN' || userType === 'BRANCH_ADMIN') {
    // fallback instituteType
    const instType = instituteType || 'school';
    const instPrefix = `/${instType}`;

    // If not on institute route, redirect to dashboard
    if (!pathname.startsWith(instPrefix)) {
      return NextResponse.redirect(new URL(`${instPrefix}/dashboard`, request.url));
    }

    return NextResponse.next();
  }

  // =============================
  // 6️⃣ DEFAULT: anything else
  // =============================
  return NextResponse.next();
}

// =============================
// CONFIG
// =============================
export const config = {
  matcher: [
    /*
      Apply middleware to everything except public routes handled above
      _next, api, static files etc are excluded
    */
    '/((?!_next|api|login|portal-login|.*\\..*).*)',
  ],
};