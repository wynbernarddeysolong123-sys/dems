import { barangayRepository } from "../repositories/barangay.repository";
import { Barangay } from "@/types/barangay-management";

export const barangayService = {
  async getAllBarangays(): Promise<Barangay[]> {
    return await barangayRepository.findAll();
  },

  async getBarangayById(id: number): Promise<Barangay | undefined> {
    return await barangayRepository.findById(id);
  },

  async createBarangay(data: Omit<Barangay, "barangay_id">): Promise<Barangay> {
    return await barangayRepository.create(data);
  },

  async updateBarangay(id: number, data: Partial<Barangay>): Promise<void> {
    await barangayRepository.update(id, data);
  },

  async deleteBarangay(id: number): Promise<void> {
    await barangayRepository.delete(id);
  },
};
