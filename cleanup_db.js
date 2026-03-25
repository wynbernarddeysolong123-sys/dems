const knex = require('knex');
const config = require('./knexfile.js').development;

const db = knex(config);

async function cleanup() {
  try {
    console.log('Dropping tables...');
    // Drop in reverse order of dependencies
    await db.schema.dropTableIfExists('admin_table');
    await db.schema.dropTableIfExists('evac_loc_table');
    await db.schema.dropTableIfExists('purok_table');
    await db.schema.dropTableIfExists('barangay_manegement_table');
    
    console.log('Clearing knex_migrations table...');
    await db('knex_migrations').truncate().catch(() => console.log('knex_migrations table not found or already empty'));
    await db('knex_migrations_lock').truncate().catch(() => console.log('knex_migrations_lock table not found or already empty'));

    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await db.destroy();
  }
}

cleanup();
