"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Building } from "lucide-react";
import { toast } from "sonner";
import { Barangay } from "@/types/barangay-management";
import { addBarangayAction, updateBarangayAction } from "@/lib/actions/barangay.action";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Dynamically import MapPicker to handle SSR (Leaflet requires window)
const MapPicker = dynamic(() => import("./mapPicker"), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full rounded-md border bg-muted animate-pulse flex items-center justify-center text-xs text-muted-foreground font-mono">
            Loading Map...
        </div>
    ),
});

interface BarangayModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    barangay?: Barangay | null; // If provided, we are in EDIT mode
    onSuccess: (updatedBarangay: Barangay) => void;
}

export function BarangayModal({
    open,
    onOpenChange,
    barangay,
    onSuccess,
}: BarangayModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Omit<Barangay, "id" | "created_at" | "updated_at">>({
        barangay_name: "",
        barangay_captain_name: "",
        signature_brgy_captain: "",
        total_population: 0,
        latitude: null,
        longitude: null,
        evacuation_needed: false,
        prone_type: "",
    });

    // Sync form with barangay prop when it changes (for editing)
    useEffect(() => {
        if (barangay) {
            setFormData({
                barangay_name: barangay.barangay_name || "",
                barangay_captain_name: barangay.barangay_captain_name || "",
                signature_brgy_captain: barangay.signature_brgy_captain || "",
                total_population: barangay.total_population || 0,
                latitude: barangay.latitude,
                longitude: barangay.longitude,
                evacuation_needed: barangay.evacuation_needed || false,
                prone_type: barangay.prone_type || "",
            });
        } else {
            setFormData({
                barangay_name: "",
                barangay_captain_name: "",
                signature_brgy_captain: "",
                total_population: 0,
                latitude: null,
                longitude: null,
                evacuation_needed: false,
                prone_type: "",
            });
        }
    }, [barangay, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.barangay_name) {
            return toast.error("Barangay name is required.");
        }

        setIsLoading(true);

        try {
            if (barangay) {
                // UPDATE
                const result = await updateBarangayAction(barangay.id, formData as Partial<Barangay>);
                if (result.success) {
                    onSuccess({ ...barangay, ...formData } as Barangay);
                    toast.success("Barangay updated successfully");
                    onOpenChange(false);
                } else {
                    toast.error(result.error || "Failed to update barangay");
                }
            } else {
                // CREATE
                const result = await addBarangayAction(formData);
                if (result.success && result.data) {
                    onSuccess(result.data as Barangay);
                    toast.success("Barangay added successfully");
                    onOpenChange(false);
                } else {
                    toast.error(result.error || "Failed to add barangay");
                }
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden border-none shadow-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Building className="h-6 w-6 text-primary" />
                            {barangay ? "Edit Barangay Details" : "Register New Barangay"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {barangay
                                ? "Update the coordinates and administrative information for this barangay."
                                : "Pin the exact location on the map and fill in the required fields below."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Main Content Area: Side-by-Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 flex-1 overflow-hidden min-h-[450px]">
                        {/* LEFT SIDE: MAP (3/5 width) */}
                        <div className="lg:col-span-3 h-full min-h-[400px] relative border-r bg-muted/30">
                            <div className="absolute inset-0">
                                <MapPicker
                                    lat={formData.latitude}
                                    lng={formData.longitude}
                                    onChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                />
                            </div>
                            {/* Floating Coordinates Overlay */}
                            <div className="absolute bottom-4 left-4 z-[9999] bg-white/90 backdrop-blur-sm p-2 rounded-md shadow-md border text-[10px] font-mono flex gap-3">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 uppercase">Latitude</span>
                                    <span className="font-semibold text-primary">{Number(formData.latitude)?.toFixed(6) ?? "Not set"}</span>
                                </div>
                                <div className="flex flex-col border-l pl-3">
                                    <span className="text-gray-400 uppercase">Longitude</span>
                                    <span className="font-semibold text-primary">{Number(formData.longitude)?.toFixed(6) ?? "Not set"}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: FORM (2/5 width) */}
                        <div className="lg:col-span-2 p-6 space-y-5 overflow-y-auto bg-white">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="barangay_name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Barangay Name</Label>
                                    <Input
                                        id="barangay_name"
                                        placeholder="e.g. Pob. District I"
                                        className="h-9 focus-visible:ring-primary/30"
                                        value={formData.barangay_name}
                                        onChange={(e) => setFormData({ ...formData, barangay_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="barangay_captain_name" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Barangay Captain</Label>
                                    <Input
                                        id="barangay_captain_name"
                                        placeholder="Full Name"
                                        className="h-9 focus-visible:ring-primary/30"
                                        value={formData.barangay_captain_name || ""}
                                        onChange={(e) => setFormData({ ...formData, barangay_captain_name: e.target.value })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="signature_upload" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Captain Signature</Label>
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => document.getElementById("signature_file")?.click()}
                                    >
                                        <div className="flex flex-col items-center justify-center h-24 w-full border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 transition-all group-hover:bg-primary/5 group-hover:border-primary/30">
                                            {formData.signature_brgy_captain ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="bg-primary/10 p-2 rounded-full">
                                                        <Save className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-gray-600 truncate max-w-[150px]">
                                                        {formData.signature_brgy_captain.split('\\').pop()?.split('/').pop() || "Signature Selected"}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1.5 text-gray-400 group-hover:text-primary/70 transition-colors">
                                                    <div className="bg-gray-100 p-2 rounded-full group-hover:bg-primary/10 group-hover:scale-110 transition-transform">
                                                        <Building className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-[10px] font-medium uppercase tracking-tight">Click to upload signature</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="signature_file"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const base64String = reader.result as string;
                                                        setFormData({ ...formData, signature_brgy_captain: base64String });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="total_population" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Population</Label>
                                        <Input
                                            id="total_population"
                                            type="number"
                                            placeholder="0"
                                            className="h-9 focus-visible:ring-primary/30"
                                            value={formData.total_population}
                                            onChange={(e) => setFormData({ ...formData, total_population: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="prone_type" className="text-xs font-semibold uppercase tracking-wider text-gray-500">Risk Type</Label>
                                        <Select
                                            value={formData.prone_type || "none"}
                                            onValueChange={(value) => setFormData({ ...formData, prone_type: value === "none" ? "" : value })}
                                        >
                                            <SelectTrigger id="prone_type" className="h-9 focus-visible:ring-primary/30">
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="Flood">Flood</SelectItem>
                                                <SelectItem value="Landslide">Landslide</SelectItem>
                                                <SelectItem value="Storm Surge">Storm Surge</SelectItem>
                                                <SelectItem value="Earthquake">Earthquake</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-dashed">
                                    <div className="flex items-start space-x-3 rounded-lg border border-primary/10 p-3 bg-primary/5 transition-colors hover:bg-primary/10">
                                        <Checkbox
                                            id="evacuation_needed"
                                            checked={formData.evacuation_needed}
                                            onCheckedChange={(checked) => setFormData({ ...formData, evacuation_needed: !!checked })}
                                            className="mt-0.5"
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="evacuation_needed"
                                                className="text-sm font-semibold leading-none cursor-pointer flex items-center gap-2"
                                            >
                                                Evacuation Recommended
                                            </label>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                Check if this area is currently unsafe and requires immediate residents relocation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 bg-gray-50/50 border-t flex flex-row items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-10 px-6 font-medium text-gray-500 hover:text-gray-900"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="h-10 px-8 gap-2 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isLoading ? "Processing..." : barangay ? "Update Barangay" : "Confirm Registration"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
