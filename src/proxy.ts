import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (middleware quedó
// deprecado) — ver node_modules/next/dist/docs/01-app/03-api-reference/
// 03-file-conventions/proxy.md. Corre en runtime Node.js por default.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // `getUser()`, no `getSession()`: revalida contra el servidor de Supabase
  // en vez de confiar en el JWT de la cookie sin verificar.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // `admin_users` tiene RLS sin ninguna policy (a propósito) — hay que
  // pasar por `is_admin()` (security definer), consultar la tabla directo
  // siempre da vacío.
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/admin/login?error=no-admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
