const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const pool = require('./config/db');

async function main() {
  try {
    // 1. Execute base schema
    const schemaPath = path.join(__dirname, '..', 'database_schema.sql');
    console.log(`Reading base schema file from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing base schema SQL on the database...');
    await pool.query(schemaSql);
    console.log('Base schema executed successfully! ✓');

    // 2. Execute patch migration
    const migrationPath = path.join(__dirname, 'migration.sql');
    console.log(`Reading patch migration file from: ${migrationPath}`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Executing patch migration SQL on the database...');
    await pool.query(migrationSql);
    console.log('Patch migration executed successfully! ✓');
    
  } catch (err) {
    console.error('Database setup failed:', err.message);
  } finally {
    await pool.end();
  }
}

main();
