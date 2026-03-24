/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("address_table", function (table) {
    // Primary Key
    table.integer("address_id").unsigned().nullable();

    // Foreign Keys & Identifiers
    table.integer("pre_reg_id").unsigned().nullable();
    table.foreign("pre_reg_id")
      .references("pre_reg_id")
      .inTable("pre_reg_table")
      .onDelete("CASCADE");

    table.integer("barangay_id").unsigned().nullable();
    table.foreign("barangay_id")
      .references("barangay_id")
      .inTable("barangay_manegement_table")
      .onDelete("SET NULL");

    // Address Details
    table.string("occupancy_type").nullable();
    table.string("region").nullable();
    table.string("province").nullable();
    table.string("city_municipality").nullable();
    table.string("district").nullable();
    table.string("house_block_number").nullable();
    table.string("street").nullable();
    table.string("sub_village").nullable();
    table.string("zip_code").nullable();
    table.integer("purok_id").unsigned().nullable();
    table.foreign("purok_id")
      .references("purok_id")
      .inTable("purok_table")
      .onDelete("SET NULL");

    // Geolocation
    table.decimal("longitude", 10, 7).nullable();
    table.decimal("latitude", 10, 7).nullable();

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("address_table");
};
