/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("account_information_table", function (table) {
    // Primary Key
    table.increments("account_information_id").primary();

    // Foreign Key to Pre-Reg Table
    table.integer("pre_reg_id").unsigned().nullable();
    table.foreign("pre_reg_id")
      .references("pre_reg_id")
      .inTable("pre_reg_table")
      .onDelete("CASCADE");

    // Account Details
    table.string("bank_Ewallet").nullable();
    table.string("account_name").nullable();
    table.string("account_type").nullable(); // e.g., Savings, Checking, etc.
    table.string("account_number").nullable();
    table.string("house_ownership").nullable(); // e.g., Owned, Rented, etc.
    table.string("shelter_damage_classification").nullable(); // e.g., Totally, Partially, etc.

    // Timestamps
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("account_information_table");
};
