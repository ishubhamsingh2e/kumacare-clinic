import { PERMISSIONS, Permission } from "@/lib/permissions";
import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

export const ROLES = {
  ADMIN: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_DELETE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_DELETE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.ROLE_READ,
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.DASHBOARD_READ,
  ],
  DOCTOR: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.DASHBOARD_READ,
  ],
  RECEPTIONIST: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
  ],

  CLINIC_MANAGER: [
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_DELETE,
    PERMISSIONS.DASHBOARD_READ,
  ],
};

export async function hasPermission(
  permission: Permission | Permission[],
): Promise<boolean> {
  const session = await getServerSession(authOptions as AuthOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const userId = session.user.id;
  const activeClinicId = session.user.activeClinicId;

  try {
    // Query the database for user's clinic membership and role
    const membership = await prisma.clinicMember.findUnique({
      where: {
        userId_clinicId: {
          userId: userId,
          clinicId: activeClinicId || "",
        },
      },
      include: {
        Role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!membership || !membership.Role) {
      return false;
    }

    // Get permissions from the role
    const userPermissions = membership.Role.permissions.map((p) => p.name);

    // Check if user has required permissions
    const requiredPermissions = Array.isArray(permission)
      ? permission
      : [permission];

    return requiredPermissions.every((p) => userPermissions.includes(p));
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

export async function hasPermissionForClinic(
  clinicId: string,
  permission: Permission | Permission[],
): Promise<boolean> {
  const session = await getServerSession(authOptions as AuthOptions);
  
  if (!session?.user?.id) {
    return false;
  }

  const userId = session.user.id;

  try {
    // Query the database for user's clinic membership and role
    const membership = await prisma.clinicMember.findUnique({
      where: {
        userId_clinicId: {
          userId: userId,
          clinicId: clinicId,
        },
      },
      include: {
        Role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!membership || !membership.Role) {
      return false;
    }

    // Get permissions from the role
    const userPermissions = membership.Role.permissions.map((p) => p.name);

    // Check if user has required permissions
    const requiredPermissions = Array.isArray(permission)
      ? permission
      : [permission];

    return requiredPermissions.every((p) => userPermissions.includes(p));
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}
