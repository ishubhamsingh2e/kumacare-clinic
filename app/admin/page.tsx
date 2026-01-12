import { hasPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assignClinicManagerRole } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

async function getUsers() {
  return prisma.user.findMany({
    include: {
      role: true,
    },
  });
}

export default async function AdminPage() {
  const canManage = await hasPermission(PERMISSIONS.CLINIC_OWNER_MANAGE);
  if (!canManage) {
    return redirect("/dashboard?error=unauthorized");
  }

  const users = await getUsers();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin - Manage Clinic Owners</h1>
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Role
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role?.name}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  {user.role?.name !== "CLINIC_MANAGER" &&
                    user.role?.name !== "SUPER_ADMIN" && (
                      <form
                        action={assignClinicManagerRole.bind(null, user.id)}
                      >
                        <Button type="submit">Make Clinic Manager</Button>
                      </form>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
