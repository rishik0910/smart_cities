const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const migrationPath = path.join(__dirname, 'migration.sql');
    console.log(`Reading migration file from: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing migration SQL on the database...');
    await pool.query(sql);
    console.log('Migration executed successfully! ✓');
    
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

main();
