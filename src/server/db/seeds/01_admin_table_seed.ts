/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const bcrypt = require("bcrypt");

exports.seed = async function (knex: any) {
  // Delete existing data
  await knex("admin_table").del();

  // Plain passwords
  const superAdminPassword = await bcrypt.hash("superadmin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);
  const staffPassword = await bcrypt.hash("staff123", 10);

  // Insert with hashed passwords
  await knex("admin_table").insert([
    {
      f_name: "Super",
      l_name: "Admin",
      email: "superadmin@gmail.com",
      password: superAdminPassword,
      role: "superadmin",
      evac_loc_id: null,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      f_name: "John",
      l_name: "Doe",
      email: "admin@gmail.com",
      password: adminPassword,
      role: "admin",
      evac_loc_id: null,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),

    },
    {
      f_name: "Jane",
      l_name: "Smith",
      email: "staff@gmail.com",
      password: staffPassword,
      role: "staff",
      evac_loc_id: null,
      is_active: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};