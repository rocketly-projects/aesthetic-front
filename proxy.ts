import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren sesión activa
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/agenda",
  "/turnos",
  "/clientes",
  "/whatsapp",
  "/servicios",
  "/negocio",
  "/config",
];

// Rutas de auth (redirigen al dashboard si ya hay sesión)
const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get("token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Sin token intentando acceder a ruta protegida → login
  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Con token intentando acceder a login/register → dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
