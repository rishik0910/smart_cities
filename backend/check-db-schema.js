const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'complaints';
    `);
    console.log('--- COMPLAINTS TABLE ---');
    console.log(res.rows);

    const res2 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wards';
    `);
    console.log('--- WARDS TABLE ---');
    console.log(res2.rows);

    const res3 = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log('--- USERS TABLE ---');
    console.log(res3.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
