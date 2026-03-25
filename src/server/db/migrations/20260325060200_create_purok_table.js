/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('purok_table', function (table) {
    // Primary Key
    table.increments('id').primary();           // Note: your SELECT uses purok_id, not id

    // Purok details
    table.string('purok_name', 150).notNullable();

    // Foreign Key to barangay
    table.integer('barangay_id').unsigned().notNullable();
    table.foreign('barangay_id')
      .references('id')                   // assuming PK in barangay_table is barangay_id
      .inTable('barangay_manegement_table')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    // Additional fields from your SELECT
    table.string('purok_leader', 150).nullable();
    table.string('pickup_point_name', 255).nullable();

    // Timestamps (recommended)
    table.timestamps(true, true);                     // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('purok_table');
};
