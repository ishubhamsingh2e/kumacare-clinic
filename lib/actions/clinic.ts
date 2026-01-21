"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { hasPermission } from "../rbac";
import { PERMISSIONS } from "../permissions";
import { authOptions } from "../auth";
import { createNotification } from "./notification";

const clinicProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email().optional().or(z.literal("")),
  bio: z.string().optional(),
  instagram: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  showOwnerInfo: z.boolean().optional(),
  ownerFieldsToShow: z
    .object({
      name: z.boolean().optional(),
      email: z.boolean().optional(),
      phone: z.boolean().optional(),
      image: z.boolean().optional(),
    })
    .optional(),
  coverImage: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
});

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  googleMapsUrl: z.string().url().optional().or(z.literal("")),
});

export async function acceptInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.email !== session.user.email) {
    throw new Error("Invitation not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.clinicMember.create({
      data: {
        userId: session.user.id,
        clinicId: invitation.clinicId,
        roleId: invitation.roleId,
      },
    });

    await tx.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });

    // Set as default if not set
    const user = await tx.user.findUnique({ where: { id: session.user.id } });
    if (!user?.defaultClinicId) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { defaultClinicId: invitation.clinicId },
      });
    }
  });

  // Notify the inviter
  revalidatePath("/dashboard");
  return { success: true, clinicId: invitation.clinicId };
}

export async function declineInvitation(invitationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.email !== session.user.email) {
    throw new Error("Invitation not found");
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REJECTED" },
  });

  // Notify the inviter
  await createNotification(
    invitation.inviterId,
    "Invitation Declined",
    `${session.user.name || session.user.email} has declined your invitation.`,
    "INVITE_REJECTED",
  );

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

export async function updateClinicProfile(payload: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "User not authenticated" };
  }

  const canUpdate = await hasPermission(PERMISSIONS.CLINIC_UPDATE);
  if (!canUpdate) {
    return { error: "You don't have permission to update the clinic." };
  }

  const validatedFields = clinicProfileSchema.safeParse(payload);
  if (!validatedFields.success) {
    return {
      error: "Invalid data",
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...data } = validatedFields.data;

  // Filter out undefined values to allow partial updates
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  );

  try {
    await prisma.clinic.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e) {
    return { error: "Failed to update clinic profile" };
  }
}

export async function addClinicLocation(payload: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeClinicId) {
    return { error: "No active clinic" };
  }
  const canUpdate = await hasPermission(PERMISSIONS.CLINIC_UPDATE);
  if (!canUpdate) {
    return { error: "Permission denied" };
  }
  const validated = locationSchema.safeParse(payload);
  if (!validated.success) {
    return { error: "Invalid data" };
  }
  await prisma.clinicLocation.create({
    data: { ...validated.data, clinicId: session.user.activeClinicId },
  });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateClinicLocation(id: string, payload: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeClinicId) {
    return { error: "No active clinic" };
  }
  const canUpdate = await hasPermission(PERMISSIONS.CLINIC_UPDATE);
  if (!canUpdate) {
    return { error: "Permission denied" };
  }
  const validated = locationSchema.safeParse(payload);
  if (!validated.success) {
    return { error: "Invalid data" };
  }
  await prisma.clinicLocation.update({
    where: { id, clinicId: session.user.activeClinicId },
    data: validated.data,
  });
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteClinicLocation(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.activeClinicId) {
    return { error: "No active clinic" };
  }
  const canUpdate = await hasPermission(PERMISSIONS.CLINIC_UPDATE);
  if (!canUpdate) {
    return { error: "Permission denied" };
  }

  const locationCount = await prisma.clinicLocation.count({
    where: { clinicId: session.user.activeClinicId },
  });

  if (locationCount <= 1) {
    return {
      error:
        "Cannot delete the last location. A clinic must have at least one location.",
    };
  }

  await prisma.clinicLocation.delete({
    where: { id, clinicId: session.user.activeClinicId },
  });
  revalidatePath("/dashboard/settings");
  return { success: true };
}
