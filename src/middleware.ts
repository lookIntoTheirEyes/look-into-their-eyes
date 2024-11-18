import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const isMobile = /mobile/i.test(userAgent);

  const response = createMiddleware(routing)(req);

  response.cookies.set("isMobile", String(isMobile), {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/", "/(he|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
