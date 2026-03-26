"use client";

import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/data-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Mail,
  ShieldAlert,
  Trash2,
  UserPlus,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddUserModal } from "@/components/admin-user/adminUserModal";
import { toast } from "sonner";
import { User } from "@/types/admin-user.types";
import {
  getUsersAction,
  deleteUserAction,
} from "@/lib/actions/admin-user.action";

export function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getUsersAction();
      if (result.success) {
        setUsers(result.data ?? []);
      } else {
        console.error(result.error);
      }
      setIsLoading(false);
    };

    fetchUsers();
  }, []); // Runs once on mount

  // Filter users based on search input
  const filteredUsers = users.filter((user) => {
    const firstName = user.f_name?.toLowerCase() || "";
    const lastName = user.l_name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const username = user.username?.toLowerCase() || ""; // Added username search too
    const search = searchTerm.toLowerCase();

    return (
      firstName.includes(search) ||
      lastName.includes(search) ||
      email.includes(search) ||
      username.includes(search)
    );
  });

  const handleDelete = async (id: number) => {
    // No more window.confirm() needed here!
    const result = await deleteUserAction(id);

    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const columns: ColumnDef<User>[] = useMemo(
    () => [
      {
        accessorKey: "user",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.f_name?.[0]?.toUpperCase() || "?"}
                  {user.l_name?.[0]?.toUpperCase() || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900 leading-none">
                  {user.f_name} {user.l_name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {user.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return (
            <Badge
              variant="outline"
              className={role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"}
            >
              {role}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" className="text-right" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Manage</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShieldAlert className="mr-2 h-4 w-4" /> Change Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) return <div>Loading users...</div>;


  const handleAddNewUser = (newUser: any) => {
    setUsers([newUser, ...users]);
    toast.success("User added successfully!");
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <AddUserModal
          onSuccess={handleAddNewUser}
          title="Create Admin Account"
          triggerLabel="Add User"
        />
      </div>

      {/* Bordered Table Container */}
      <div className="rounded-none border border-gray-200 bg-white overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filteredUsers} />
      </div>
    </div>
  );
}
