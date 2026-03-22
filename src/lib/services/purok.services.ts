import { purokRepository } from "@/lib/repositories/purok.repository";
import { Purok } from "@/types/purok-management";

export const purokService = {
  async getAllByBarangay(barangayId: number): Promise<Purok[]> {
    return purokRepository.getAllByBarangayId(barangayId);
  },

  async getPurokById(id: number): Promise<Purok | undefined> {
    return purokRepository.getById(id);
  },

  async createPurok(data: Omit<Purok, "purok_id">): Promise<Purok> {
    return purokRepository.create(data);
  },

  async updatePurok(id: number, data: Partial<Purok>): Promise<void> {
    return purokRepository.update(id, data);
  },

  async deletePurok(id: number): Promise<void> {
    return purokRepository.delete(id);
  },
};
