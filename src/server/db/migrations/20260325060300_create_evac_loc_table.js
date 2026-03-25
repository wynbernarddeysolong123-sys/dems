/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('evac_loc_table', function (table) {
    // Primary Key
    table.increments('id').primary();

    // Basic information
    table.string('city', 100).notNullable();
    table.string('name', 255).notNullable();                    // Evacuation center name

    // Foreign Key - only purok_id (correct design as we discussed)
    table.integer('purok_id').unsigned().notNullable();
    table.foreign('purok_id')
      .references('id')
      .inTable('purok_table')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    // Capacity & Status
    table.integer('total_capacity').unsigned().notNullable().defaultTo(0);
    table.enum('status', ['active', 'inactive', 'full', 'maintenance'])
      .notNullable()
      .defaultTo('active');

    // Geographic coordinates
    table.decimal('longitude', 11, 8).nullable();
    table.decimal('latitude', 10, 8).nullable();

    // Timestamps
    table.timestamps(true, true);   // created_at and updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('evac_loc_table');
};
