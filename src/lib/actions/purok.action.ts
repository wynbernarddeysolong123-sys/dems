"use server";

import { purokService } from "@/lib/services/purok.services";
import { revalidatePath } from "next/cache";
import { Purok } from "@/types/purok-management";

export async function getPuroksByBarangayAction(barangayId: number) {
  try {
    const puroks = await purokService.getAllByBarangay(barangayId);
    return { success: true, data: puroks };
  } catch (error) {
    return { success: false, error: "Failed to fetch puroks" };
  }
}

export async function addPurokAction(data: Omit<Purok, "purok_id">) {
  try {
    const newPurok = await purokService.createPurok(data);
    revalidatePath("/dashboard/purok");
    revalidatePath("/dashboard/barangay");
    revalidatePath("/dashboard/barangay/[id]", "page");
    return { success: true, data: newPurok };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add purok" };
  }
}

export async function updatePurokAction(id: number, data: Partial<Purok>) {
  try {
    await purokService.updatePurok(id, data);
    revalidatePath("/dashboard/purok");
    revalidatePath("/dashboard/barangay");
    revalidatePath("/dashboard/barangay/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update purok" };
  }
}

export async function deletePurokAction(id: number) {
  try {
    await purokService.deletePurok(id);
    revalidatePath("/dashboard/purok");
    revalidatePath("/dashboard/barangay");
    revalidatePath("/dashboard/barangay/[id]", "page");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete purok" };
  }
}
