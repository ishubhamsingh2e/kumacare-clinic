import { hasPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getUsers() {
	const session = await auth();
	if (!session?.user?.clinicId) {
		return [];
	}

	return prisma.user.findMany({
		where: {
			clinicId: session.user.clinicId,
		},
		include: {
			role: true,
		},
	});
}

export default async function UsersPage() {
	const canManageUsers = await hasPermission(PERMISSIONS.USER_MANAGE);
	if (!canManageUsers) {
		return redirect("/dashboard?error=unauthorized");
	}

	const users = await getUsers();

	return (
		<div>
			<h1 className="text-2xl font-bold">User Management</h1>
			<p className="text-muted-foreground text-sm">
				Manage users in your clinic.
			</p>
			{/* TODO: Add UI for user table, invite button, etc. */}
			<pre>{JSON.stringify(users, null, 2)}</pre>
		</div>
	);
}
