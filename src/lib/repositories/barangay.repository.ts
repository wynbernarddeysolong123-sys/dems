import { db } from "@/server/db/connection";
import { Barangay } from "@/types/barangay-management";

export const barangayRepository = {
  async findAll(): Promise<Barangay[]> {
    const barangays = await db("barangay_manegement_table")
      .select("*")
      .orderBy("barangay_id", "desc");

    return barangays as Barangay[];
  },

  async findById(barangay_id: number): Promise<Barangay | undefined> {
    return await db("barangay_manegement_table")
      .where({ barangay_id })
      .first();
  },

  async create(data: Omit<Barangay, "barangay_id">): Promise<Barangay> {
    const [insertedId] = await db("barangay_manegement_table").insert(data);
    const newBarangay = await db("barangay_manegement_table")
      .where({ barangay_id: insertedId })
      .first();
    return newBarangay as Barangay;
  },

  async update(barangay_id: number, data: Partial<Barangay>): Promise<void> {
    await db("barangay_manegement_table")
      .where({ barangay_id })
      .update(data);
  },

  async delete(barangay_id: number): Promise<void> {
    await db("barangay_manegement_table")
      .where({ barangay_id })
      .delete();
  },
};
