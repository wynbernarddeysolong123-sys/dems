import { db } from "@/server/db/connection";
import { User, CreateUserInput } from "@/types/admin-user.types";

export const userRepository = {
  /**
   * Insert user into MySQL and return the created record
   */
  async create(data: CreateUserInput): Promise<User> {
    const [insertedId] = await db("admin_table").insert({
      f_name: data.f_name,
      l_name: data.l_name,
      username: data.username,
      password: data.password,
      email: data.email,
      role: data.role,
    });

    const newUser = await db("admin_table")
      .where({ admin_id: insertedId })
      .first();
    return newUser as User;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    return await db("admin_table").where({ email }).first();
  },

  async findAll(): Promise<User[]> {
    const users = await db("admin_table")
      .select("*")
      .whereNull("deleted_at")
      .orderBy("admin_id", "desc");

    return users as User[];
  },

  async delete(admin_id: number): Promise<void> {
    await db("admin_table").where({ admin_id }).update({
      deleted_at: new Date(), // Sets the current timestamp
    });
  },
};
