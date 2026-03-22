/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("pre_reg_table", function (table) {
    // Primary Key
    table.increments("pre_reg_id").primary();

    // Personal Information
    table.string("f_name").notNullable();
    table.string("m_name").nullable();
    table.string("l_name").notNullable();
    table.string("name_ext").nullable();
    table.string("gender").notNullable();
    table.date("date_of_birth").notNullable();
    table.string("place_of_birth").notNullable();
    table.string("mother_maiden_name").nullable();

    // Contact & Credentials
    table.string("contact_no").notNullable();
    table.string("email_address").notNullable().unique();
    table.string("password").notNullable();
    table.timestamp("registered_date").defaultTo(knex.fn.now());

    // Demographic & Social Data
    table.string("registered_as").notNullable(); // e.g., Resident, Head of Family
    table.string("civil_status").notNullable();
    table.string("religion").nullable();
    table.string("occupation").nullable();
    table.decimal("monthly_income", 15, 2).defaultTo(0.00);
    table.string("highest_education_attainment").nullable();
    table.string("ethnicity").nullable();
    table.boolean("indigenous_people").defaultTo(false);
    table.boolean("4ps_beneficiary").defaultTo(false);

    // Identifiers & Foreign Keys
    table.integer("address_id").unsigned().nullable();
    table.string("relation_to_family").nullable();
    table.integer("age_class_id").unsigned().nullable();
    table.integer("qr_id").unsigned().nullable();
    table.integer("account_information_id").unsigned().nullable();

    // Health & Vulnerability
    table.string("type_vulnerability").nullable();
    table.boolean("have_special_needs").defaultTo(false);
    table.text("special_needs").nullable();

    // Verification & Media
    table.string("id_card_presented").nullable();
    table.string("id_card_number").nullable();
    table.text("id_card_image").nullable(); // Stores path or URL
    table.text("profile_pic").nullable();
    table.text("signature").nullable(); // Often stored as Base64 or path

    // Logistics & Evacuation
    table.string("recommended_location").nullable();
    table.string("pickup_point_name").nullable();
    table.boolean("have_vehicle").defaultTo(false);
    table.string("vehicle_type").nullable();
    table.boolean("intend_evacuation").defaultTo(false);
    table.string("where_to_go").nullable();

    // System Status
    table.string("status").defaultTo("pending");
    table.timestamps(true, true); // Adds created_at and updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("pre_reg_table");
};