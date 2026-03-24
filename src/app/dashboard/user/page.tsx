import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { UserManagement } from "@/components/admin-user/adminUserManagement";
import { userService } from "@/lib/services/admin-user.services";


export default async function UsersPage() {
  const session = await auth();
    // 1. Security Check (Casting to string to avoid the TS comparison error)
    if (!session || (session.user?.role as string) !== "admin" &&(session.user?.role as string) !== "superadmin" ) {
      redirect("/dashboard");
    }

    const users = await userService.getAllUsers();

  return (
    <MainLayout>
      {/* Header Section matching your style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
        </div>
      </div>

      {/* The Management Table Component */}
      <div className="mt-4">
        <UserManagement initialUsers={users} />
      </div>
    </MainLayout>
  );
}
