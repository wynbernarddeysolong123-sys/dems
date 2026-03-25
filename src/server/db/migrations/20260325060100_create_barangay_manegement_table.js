/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('barangay_manegement_table', function (table) {
    // Primary Key
    table.increments('id').primary();

    // Barangay Information
    table.string('barangay_name', 150).notNullable().unique();           // Usually unique per city/municipality

    table.string('barangay_captain_name', 150).notNullable();
    table.string('signature_brgy_captain', 255).nullable();              // path to signature image or base64

    table.integer('total_population').unsigned().notNullable().defaultTo(0);

    // Geographic coordinates
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();

    // Evacuation & Risk fields
    table.boolean('evacuation_needed').notNullable().defaultTo(false);
    table.enum('prone_type', ['flood', 'landslide', 'storm_surge', 'earthquake', 'none', 'multiple'])
      .notNullable()
      .defaultTo('none');

    // Timestamps
    table.timestamps(true, true);   // created_at, updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('barangay_manegement_table');
};