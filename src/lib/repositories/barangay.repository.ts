import { db } from "@/server/db/connection";
import { Barangay } from "@/types/barangay-management";

export const barangayRepository = {
  async findAll(): Promise<Barangay[]> {
    const barangays = await db("barangay_manegement_table")
      .select("*")
      .orderBy("id", "desc");

    return barangays as Barangay[];
  },

  async findById(id: number): Promise<Barangay | undefined> {
    return await db("barangay_manegement_table")
      .where({ id })
      .first();
  },

  async create(data: Omit<Barangay, "id">): Promise<Barangay> {
    const [insertedId] = await db("barangay_manegement_table").insert(data);
    const newBarangay = await db("barangay_manegement_table")
      .where({ id: insertedId })
      .first();
    return newBarangay as Barangay;
  },

  async update(id: number, data: Partial<Barangay>): Promise<void> {
    await db("barangay_manegement_table")
      .where({ id })
      .update(data);
  },

  async delete(id: number): Promise<void> {
    await db("barangay_manegement_table")
      .where({ id })
      .delete();
  },
};
