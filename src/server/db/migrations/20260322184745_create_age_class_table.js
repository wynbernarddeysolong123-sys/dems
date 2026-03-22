/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("age_class_table", function (table) {
    // Primary Key
    table.increments("age_class_id").primary();

    // Classification Name
    table.string("classification").notNullable(); // e.g., Minor, Adult, Senior Citizen

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("age_class_table");
};
