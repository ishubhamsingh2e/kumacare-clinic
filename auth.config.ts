import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ];
      const isPublicRoute = publicRoutes.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect to login
      }

      if (isOnAdmin) {
        if (auth.user.email) {
          const user = await prisma.user.findUnique({
            where: { email: auth.user.email },
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          });
          const userPermissions =
            user?.role?.permissions.map((p) => p.name) ?? [];
          if (userPermissions.includes(PERMISSIONS.CLINIC_OWNER_MANAGE)) {
            return true;
          }
        }
        return Response.redirect(
          new URL("/dashboard?error=unauthorized", nextUrl),
        );
      }

      if (isOnDashboard) {
        // any logged in user can access dashboard for now
        // specific dashboard page permissions can be added here
        if (nextUrl.pathname.startsWith("/dashboard/settings")) {
          const userPermissions = auth?.user?.permissions ?? [];
          if (userPermissions.includes(PERMISSIONS.SETTINGS_EDIT)) {
            return true;
          }
          return Response.redirect(
            new URL("/dashboard?error=unauthorized", nextUrl),
          );
        }
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
