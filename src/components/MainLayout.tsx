"use client";

import { useState } from "react";
import { Sidebar } from "./layout/sideBar";
import { Topbar } from "./layout/topBar";
import { useSession } from "next-auth/react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: session } = useSession();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={session?.user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar user={session?.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
