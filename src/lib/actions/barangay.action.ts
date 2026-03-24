"use server";

import { barangayService } from "@/lib/services/barangay.services";
import { revalidatePath } from "next/cache";
import { Barangay } from "@/types/barangay-management";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function getBarangaysAction() {
  try {
    const barangays = await barangayService.getAllBarangays();
    return { success: true, data: barangays };
  } catch (error) {
    return { success: false, error: "Failed to fetch barangays" };
  }
}

async function saveSignature(base64Data: string): Promise<string | null> {
  if (!base64Data || !base64Data.startsWith("data:image/")) {
    return base64Data; // Already a path or invalid
  }

  try {
    const base64Content = base64Data.split(";base64,").pop();
    if (!base64Content) return null;

    const buffer = Buffer.from(base64Content, "base64");
    
    // Determine extension
    const mimeMatch = base64Data.match(/data:image\/([a-zA-Z+]+);/);
    const ext = mimeMatch ? mimeMatch[1] : "png";
    
    const filename = `sig_${Date.now()}_${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "signatures");
    const filePath = path.join(uploadDir, filename);

    // Ensure dir exists (redundant but safe)
    await fs.mkdir(uploadDir, { recursive: true });
    
    await fs.writeFile(filePath, buffer);
    return `/uploads/signatures/${filename}`;
  } catch (error) {
    console.error("Error saving signature:", error);
    return null;
  }
}

export async function deleteBarangayAction(id: number) {
  try {
    await barangayService.deleteBarangay(id);
    revalidatePath("/dashboard/barangay");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete barangay" };
  }
}

export async function updateBarangayAction(id: number, data: Partial<Barangay>) {
  try {
    if (data.signature_brgy_captain) {
        const savedPath = await saveSignature(data.signature_brgy_captain);
        if (savedPath) {
            data.signature_brgy_captain = savedPath;
        }
    }
    await barangayService.updateBarangay(id, data);
    revalidatePath("/dashboard/barangay");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update barangay" };
  }
}

export async function addBarangayAction(data: Omit<Barangay, "barangay_id">) {
  try {
    if (data.signature_brgy_captain) {
        const savedPath = await saveSignature(data.signature_brgy_captain);
        if (savedPath) {
            data.signature_brgy_captain = savedPath;
        }
    }
    const newBarangay = await barangayService.createBarangay(data);
    revalidatePath("/dashboard/barangay");
    return { success: true, data: newBarangay };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add barangay" };
  }
}
