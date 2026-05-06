import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token    = request.cookies.get("token")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Sin token intentando acceder a ruta protegida → login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Con token intentando acceder a login → dashboard
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
