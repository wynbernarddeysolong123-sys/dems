import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // 1. If trying to access dashboard while logged out -> Redirect to Login
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 2. If trying to access login while ALREADY logged in -> Redirect to Dashboard
  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};