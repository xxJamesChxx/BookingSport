import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register"];

const adminRoutes = [
  "/adminbookings",
  "/courts",
  "/sport_type",
  "/timeslots",
  "/roles",
  "/users",
];

const customerRoutes = [
  "/bookings",
  "/mybookings",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  const roleName = request.cookies.get("roleName")?.value;

  if (publicRoutes.includes(pathname)) {
    if (accessToken) {
      const targetRoute = roleName === "Admin" ? "/adminbookings" : "/bookings";
      
      if (pathname !== targetRoute) {
        return NextResponse.redirect(new URL(targetRoute, request.url));
      }
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (customerRoutes.some((route) => pathname.startsWith(route))) {
    if (roleName === "Admin") {
      return NextResponse.redirect(new URL("/adminbookings", request.url));
    }
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (roleName !== "Admin") {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/hmr|favicon.ico|images).*)",
  ],
};