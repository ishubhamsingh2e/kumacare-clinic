import { auth } from "@/lib/auth";
import { PERMISSIONS, Permission } from "@/lib/permissions";

export async function hasPermission(
	permission: Permission | Permission[],
): Promise<boolean> {
	const session = await auth();
	const userPermissions = session?.user?.permissions ?? [];
	const requiredPermissions = Array.isArray(permission)
		? permission
		: [permission];
	return requiredPermissions.every((p) => userPermissions.includes(p));
}
