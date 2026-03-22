/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("address_table", function (table) {
    // 1. Drop existing foreign key constraints
    table.dropForeign("barangay_id");
    table.dropForeign("purok_id");

    // 2. Change barangay_id and purok_id to string to accommodate PSGC codes
    table.string("barangay_id").nullable().alter();
    table.string("purok_id").nullable().alter();

    // 3. Fix address_id (if needed, making it increments is safer)
    // Wait, altering to increments is tricky in some DBs. 
    // I'll leave address_id for now if it's not causing the error yet.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("address_table", function (table) {
    // Re-add constraints (might fail if data is invalid)
    table.integer("barangay_id").unsigned().nullable().alter();
    table.integer("purok_id").unsigned().nullable().alter();
    
    table.foreign("barangay_id")
      .references("barangay_id")
      .inTable("barangay_manegement_table")
      .onDelete("SET NULL");
      
    table.foreign("purok_id")
      .references("purok_id")
      .inTable("purok_table")
      .onDelete("SET NULL");
  });
};
