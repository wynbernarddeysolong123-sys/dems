/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("pre_registration", (table) => {
    // 1. Primary Identification
    table.increments("id").primary();

    // 2. Family/Group Identification
    // Groups multiple family members under one unique registration ID
    table.string("family_group_id").notNullable().index();
    
    // The specific string encoded in the QR code (used for scanning)
    table.string("qr_code_token").notNullable().unique().index();

    // 3. Member Personal Details
    table.string("full_name").notNullable();
    table.string("relationship").notNullable(); // 'Head', 'Spouse', 'Child', etc.
    table.integer("age").nullable();
    table.enum("gender", ["Male", "Female", "Other"]).nullable();

    // 4. Contact & Location (Bago City context)
    table.string("contact_number").nullable();
    table.string("barangay").nullable().index();
    table.string("purok").nullable();
    
    // 5. Status & Verification (For use at the Evacuation Center)
    table.boolean("is_verified").defaultTo(false);
    table.timestamp("verified_at").nullable();
    
    // 6. Metadata & Soft Deletes
    table.timestamps(true, true); // Adds created_at and updated_at
    table.timestamp("deleted_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("pre_registration");
};