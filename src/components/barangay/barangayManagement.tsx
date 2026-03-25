"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table/data-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Users,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { deleteBarangayAction } from "@/lib/actions/barangay.action";
import { BarangayModal } from "./barangayModal";
import { Barangay } from "@/types/barangay-management";
import { Eye } from "lucide-react";


function EvacuationBadge({ needed }: { needed: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full font-mono text-[9px] uppercase tracking-[0.1em] border ${needed
        ? "bg-red-50 text-red-500 border-red-200"
        : "bg-green-50 text-green-600 border-green-200"
        }`}
    >
      {needed ? (
        <AlertTriangle className="h-2.5 w-2.5" />
      ) : (
        <span>●</span>
      )}
      {needed ? "Needed" : "Safe"}
    </span>
  );
}

function ProneBadge({ type }: { type: string | null }) {
  if (!type) return <span className="text-gray-300 text-xs">—</span>;

  const map: Record<string, string> = {
    flood: "bg-blue-50 text-blue-600 border-blue-200",
    landslide: "bg-amber-50 text-amber-600 border-amber-200",
    "storm surge": "bg-cyan-50 text-cyan-600 border-cyan-200",
    earthquake: "bg-orange-50 text-orange-600 border-orange-200",
    drought: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };
  const cls =
    map[type.toLowerCase()] ?? "bg-violet-50 text-violet-500 border-violet-200";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-[3px] rounded-full font-mono text-[9px] uppercase tracking-[0.1em] border ${cls}`}
    >
      <ShieldAlert className="h-2.5 w-2.5" />
      {type}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BarangayManagement({
  initialBarangays,
}: {
  initialBarangays: Barangay[];
}) {
  const [barangays, setBarangays] = useState<Barangay[]>(
    initialBarangays || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null);

  const router = useRouter();

  const handleCreate = () => {
    setSelectedBarangay(null);
    setModalOpen(true);
  };

  const handleEdit = (barangay: Barangay) => {
    setSelectedBarangay(barangay);
    setModalOpen(true);
  };

  const handleViewDetails = (barangay: Barangay) => {
    router.push(`/dashboard/barangay/${barangay.id}`);
  };

  const handleSuccess = (updatedBarangay: Barangay) => {
    if (selectedBarangay) {
      // If we were editing, update the item in the list
      setBarangays((prev) =>
        prev.map((b) => b.id === updatedBarangay.id ? updatedBarangay : b)
      );
    } else {
      // If we were adding, add the new item to the top
      setBarangays((prev) => [updatedBarangay, ...prev]);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────

  const columns: ColumnDef<Barangay>[] = useMemo(
    () => [
      {
        accessorKey: "barangay_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Barangay" />
        ),
        cell: ({ row }) => {
          const brgy = row.original;
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-white font-semibold text-xs">
                {brgy.barangay_name[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {brgy.barangay_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Capt. {brgy.barangay_captain_name || "—"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "total_population",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Population" />
        ),
        cell: ({ row }) => {
          const count = row.getValue("total_population") as number;
          return (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm">
                {count.toLocaleString()}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "evacuation_needed",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const needed = row.getValue("evacuation_needed") as boolean;
          return <EvacuationBadge needed={needed} />;
        },
      },
      {
        accessorKey: "prone_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Risk Type" />
        ),
        cell: ({ row }) => {
          const type = row.getValue("prone_type") as string | null;
          return <ProneBadge type={type} />;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const brgy = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                    Manage
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => handleViewDetails(brgy)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2"
                    onClick={() => handleEdit(brgy)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Barangay
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-red-500 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                    onClick={() => handleDelete(brgy.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
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

  // ── Derived filtered list ────────────────────────────────────────────

  const filteredBarangays = barangays.filter((b) => {
    const search = searchTerm.toLowerCase();
    return (
      b.barangay_name.toLowerCase().includes(search) ||
      (b.barangay_captain_name?.toLowerCase() ?? "").includes(search) ||
      (b.prone_type?.toLowerCase() ?? "").includes(search)
    );
  });

  // ── Actions ──────────────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteBarangayAction(id);
      if (!res.success) throw new Error(res.error);
      setBarangays((prev) => prev.filter((b) => b.id !== id));
      toast.success("Barangay deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete barangay.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading barangays...</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            id="barangay-search"
            placeholder="Search barangay, captain, or prone type..."
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button id="add-barangay-btn" className="gap-2" onClick={handleCreate}>
          <PlusCircle className="h-4 w-4" />
          Add Barangay
        </Button>
      </div>

      <BarangayModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        barangay={selectedBarangay}
        onSuccess={handleSuccess}
      />

      {/* Table */}
      <div className="rounded-none border border-gray-200 bg-white overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filteredBarangays} />
      </div>

      {/* Footer count */}
      <p className="text-xs text-muted-foreground">
        Showing {filteredBarangays.length} of {barangays.length} barangay
        {barangays.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
