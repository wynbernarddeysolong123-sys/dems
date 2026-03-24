import { db } from "@/server/db/connection";
import { Purok } from "@/types/purok-management";

export const purokRepository = {
  async getAll(): Promise<Purok[]> {
    return db("purok_table").select(
      "purok_id",
      "purok_name",
      "barangay_id",
      "purok_leader",
      "pickup_point_name"
    );
  },

  async getAllByBarangayId(barangayId: number): Promise<Purok[]> {
    return db("purok_table")
      .where("barangay_id", barangayId)
      .orderBy("purok_name", "asc");
  },

  async getById(id: number): Promise<Purok | undefined> {
    return db("purok_table").where("purok_id", id).first();
  },

  async create(data: Omit<Purok, "purok_id" | "created_at" | "updated_at">): Promise<Purok> {
    const [id] = await db("purok_table").insert(data);
    return { ...data, purok_id: id } as Purok;
  },

  async update(id: number, data: Partial<Purok>): Promise<void> {
    await db("purok_table").where("purok_id", id).update({
      ...data,
      updated_at: db.fn.now(),
    });
  },

  async delete(id: number): Promise<void> {
    await db("purok_table").where("purok_id", id).delete();
  },
};
