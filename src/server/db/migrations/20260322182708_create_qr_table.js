/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("qr_table", function (table) {
    // Primary Key
    table.increments("qr_id").primary();

    // Foreign Key to Pre-Reg Table
    table.integer("pre_reg_id").unsigned().nullable();
    table.foreign("pre_reg_id")
      .references("pre_reg_id")
      .inTable("pre_reg_table")
      .onDelete("CASCADE");

    // QR Code Data
    table.text("code").nullable(); // Stores the QR code string or Base64

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("qr_table");
};
