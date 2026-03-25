"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Purok } from "@/types/purok-management";
import { addPurokAction, updatePurokAction } from "@/lib/actions/purok.action";
import { toast } from "sonner";

interface PurokModalProps {
    isOpen: boolean;
    onClose: () => void;
    purok?: Purok;
    barangayId: number;
    onSuccess: () => void;
}

export function PurokModal({ isOpen, onClose, purok, barangayId, onSuccess }: PurokModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Purok, "id" | "created_at" | "updated_at">>({
        purok_name: "",
        barangay_id: barangayId,
        purok_leader: "",
        pickup_point_name: "",
    });

    useEffect(() => {
        if (purok) {
            setFormData({
                purok_name: purok.purok_name,
                barangay_id: purok.barangay_id,
                purok_leader: purok.purok_leader || "",
                pickup_point_name: purok.pickup_point_name || "",
            });
        } else {
            setFormData({
                purok_name: "",
                barangay_id: barangayId,
                purok_leader: "",
                pickup_point_name: "",
            });
        }
    }, [purok, barangayId]);

    const handleSubmit = async () => {
        if (!formData.purok_name.trim()) {
            toast.error("Purok name is required");
            return;
        }

        setIsLoading(true);
        try {
            const result = purok 
                ? await updatePurokAction(purok.id, formData)
                : await addPurokAction(formData);

            if (result.success) {
                toast.success(purok ? "Purok updated successfully" : "Purok added successfully");
                onSuccess();
                onClose();
            } else {
                toast.error(result.error || "Failed to save purok");
            }
        } catch (error) {
            console.error("Failed to save purok:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{purok ? "Edit Purok" : "Add New Purok"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="purok_name">Purok Name</Label>
                        <Input
                            id="purok_name"
                            className="rounded-none border-gray-300 focus:border-blue-500"
                            placeholder="Enter purok name"
                            value={formData.purok_name}
                            onChange={(e) => setFormData({ ...formData, purok_name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="purok_leader">Purok Leader</Label>
                        <Input
                            id="purok_leader"
                            className="rounded-none border-gray-300 focus:border-blue-500"
                            placeholder="Enter leader name"
                            value={formData.purok_leader}
                            onChange={(e) => setFormData({ ...formData, purok_leader: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="pickup_point">Pickup Point</Label>
                        <Input
                            id="pickup_point"
                            className="rounded-none border-gray-300 focus:border-blue-500"
                            placeholder="Enter pickup point location"
                            value={formData.pickup_point_name}
                            onChange={(e) => setFormData({ ...formData, pickup_point_name: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" className="rounded-none" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        className="rounded-none bg-blue-600 hover:bg-blue-700 font-semibold" 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : (purok ? "Save Changes" : "Add Purok")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
