/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('admin_table', function (table) {
    table.increments('id').primary();   // admin's own PK

    table.string('f_name', 100).notNullable();
    table.string('l_name', 100).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('admin');
    table.boolean('is_active').notNullable().defaultTo(true);

    // === THIS IS THE CRITICAL PART ===
    table.integer('evac_loc_id').unsigned().nullable();   // ← .unsigned() must be here

    table.foreign('evac_loc_id')
      .references('id')
      .inTable('evac_loc_table')
      .onUpdate('CASCADE')
      .onDelete('SET NULL');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('admin_table');
};