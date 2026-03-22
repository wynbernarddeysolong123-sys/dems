/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("barangay_manegement_table", function (table) {
    // Primary Key
    table.increments("barangay_id").primary();

    // Barangay Information
    table.string("barangay_name").notNullable();
    table.string("barangay_captain_name").nullable();
    table.text("signature_brgy_captain").nullable(); // Stored as path or Base64

    // Population
    table.integer("total_population").unsigned().defaultTo(0);

    // Geolocation
    table.decimal("latitude", 10, 7).nullable();
    table.decimal("longitude", 10, 7).nullable();

    // Disaster / Evacuation Info
    table.boolean("evacuation_needed").defaultTo(false);
    table.string("prone_type").nullable(); // e.g., flood, landslide, storm surge

    // Timestamps
    table.timestamps(true, true); // created_at and updated_atz
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("barangay_manegement_table");
};
