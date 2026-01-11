"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
});

export async function updateUser(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "Not authenticated", type: "error" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  const parsed = updateUserSchema.safeParse({ name, email });

  if (!parsed.success) {
    return { message: parsed.error.issues.map(e => e.message).join(', '), type: "error" };
  }

  const dataToUpdate: { name?: string; email?: string } = {};
  if (parsed.data.name && parsed.data.name !== session.user.name) {
    dataToUpdate.name = parsed.data.name;
  }
  if (parsed.data.email && parsed.data.email !== session.user.email) {
    dataToUpdate.email = parsed.data.email;
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return { message: "No changes to update.", type: "info" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    revalidatePath("/dashboard/settings");

    return { message: "Profile updated successfully.", type: "success" };
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return { message: "This email is already in use.", type: "error" };
    }
    return { message: "Failed to update profile.", type: "error" };
  }
}
