"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Purok } from "@/types/purok-management";
import { DataTable } from "@/components/table/data-table";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { deletePurokAction } from "@/lib/actions/purok.action";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface PurokTableProps {
    data: Purok[];
    onEdit: (purok: Purok) => void;
    onRefresh: () => void;
}

export function PurokTable({ data, onEdit, onRefresh }: PurokTableProps) {
    const columns: ColumnDef<Purok>[] = useMemo(
        () => [
            {
                accessorKey: "purok_name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Purok" />
                ),
                cell: ({ row }) => {
                    const purok = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-semibold text-xs">
                                {purok.purok_name[0]?.toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                    {purok.purok_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Leader: {purok.purok_leader || "—"}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "pickup_point_name",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Pickup Point" />
                ),
                cell: ({ row }) => {
                    const value = row.original.pickup_point_name;
                    return (
                        <span className={!value ? "text-gray-300 text-xs" : ""}>
                            {value || "---"}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const purok = row.original;
                    const handleDelete = async () => {
                        if (confirm(`Are you sure you want to delete "${purok.purok_name}"?`)) {
                            try {
                                const result = await deletePurokAction(purok.purok_id);
                                if (result.success) {
                                    toast.success("Purok deleted successfully");
                                    onRefresh();
                                } else {
                                    toast.error(result.error || "Failed to delete purok");
                                }
                            } catch (error) {
                                toast.error("An unexpected error occurred");
                            }
                        }
                    };

                    return (
                        <div className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-none">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 rounded-none">
                                    <DropdownMenuLabel className="text-gray-500 font-mono text-[10px] uppercase tracking-wider">
                                        Manage
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="rounded-none" />
                                    <DropdownMenuItem
                                        className="cursor-pointer gap-2 rounded-none"
                                        onClick={() => onEdit(purok)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                        Edit Purok
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="rounded-none" />
                                    <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 rounded-none"
                                        onClick={handleDelete}
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
        [onEdit, onRefresh]
    );

    return (
        <div className="mt-4 border rounded-none bg-white">
            <DataTable 
                columns={columns} 
                data={data} 
                searchKey="purok_name" 
                searchPlaceholder="Search puroks..." 
            />
        </div>
    );
}
