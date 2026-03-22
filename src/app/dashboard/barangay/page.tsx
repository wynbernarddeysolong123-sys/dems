import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { BarangayManagement } from "@/components/barangay/barangayManagement";
import { barangayService } from "@/lib/services/barangay.services";

export default async function BarangayPage() {
  const session = await auth();

  // 1. Security Check
  if (!session || ((session.user?.role as string) !== "admin" && (session.user?.role as string) !== "superadmin")) {
    redirect("/dashboard");
  }

  // 2. Data Fetching
  const barangays = await barangayService.getAllBarangays();

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Barangay Management</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor barangay information and disaster preparedness.</p>
        </div>
      </div>

      <div className="mt-4">
        <BarangayManagement initialBarangays={barangays} />
      </div>
    </MainLayout>
  );
}
