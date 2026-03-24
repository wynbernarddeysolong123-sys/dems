/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("purok_table", function (table) {
    // Primary Key
    table.increments("purok_id").primary();

    // Purok Information
    table.string("purok_name").notNullable();
    
    // Foreign Key to Barangay Management Table
    table.integer("barangay_id").unsigned().notNullable();
    table.foreign("barangay_id").references("barangay_id").inTable("barangay_manegement_table").onDelete("CASCADE");

    // Additional Information
    table.string("purok_leader").nullable();
    table.string("pickup_point_name").nullable();

    // Timestamps
    table.timestamps(true, true); // created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("purok_table");
};
