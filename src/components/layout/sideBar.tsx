"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Users, Settings, Building, Menu } from "lucide-react";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: any; // Ideally use your Session type here
}

export function Sidebar({ isOpen, setIsOpen, user }: SidebarProps) {
  const links = [
    { title: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    {
      title: "Users",
      href: "/dashboard/user",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Barangay",
      href: "/dashboard/barangay",
      icon: <Building className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  return (
    <aside
      className={`${isOpen ? "w-64" : "w-16"} bg-white border-r transition-all duration-300 flex flex-col`}
    >
      <div className="flex items-center justify-between p-3 border-b">
        <span
          className={`${isOpen ? "block" : "hidden"} font-bold text-lg truncate`}
        >
          Dashboard
        </span>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <nav className="flex flex-col space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center p-2 text-gray-700 rounded hover:bg-gray-100"
            >
              <span className={isOpen ? "mr-2" : ""}>{link.icon}</span>
              {isOpen && <span>{link.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
