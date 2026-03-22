import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import MainLayout from "@/components/MainLayout";
import { barangayService } from "@/lib/services/barangay.services";
import { BarangayDetailView } from "@/components/barangay/barangayDetailView";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BarangayDetailPage({ params }: PageProps) {
  const session = await auth();

  // 1. Security Check
  if (!session || ((session.user?.role as string) !== "admin" && (session.user?.role as string) !== "superadmin")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const barangayId = parseInt(id);

  if (isNaN(barangayId)) {
    notFound();
  }

  // 2. Data Fetching
  const barangay = await barangayService.getBarangayById(barangayId);

  if (!barangay) {
    notFound();
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
          {barangay.barangay_name}
        </h1>
        <p className="text-muted-foreground mt-1">Detailed information and sub-location management.</p>
      </div>

      <BarangayDetailView barangay={barangay} />
    </MainLayout>
  );
}
