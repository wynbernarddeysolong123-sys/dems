// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import MainLayout from "@/components/MainLayout";

export default async function DashboardPage() {
  const session = await auth();
  console.log("session:", session);

  if (!session) {
    redirect("/login");
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}</h1>
      <p>You are logged in as: {session.user?.role}</p>
    </MainLayout>
  );
}
