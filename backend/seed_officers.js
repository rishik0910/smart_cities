require('dotenv').config({ path: 'c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/.env' });
const db = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/config/db');
const bcrypt = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/node_modules/bcrypt');

(async () => {
  try {
    console.log('Starting officer seeding and assignment...');
    
    // Hash password for the new officer
    const passwordHash = await bcrypt.hash('Officer@123', 10);

    // 1. Ensure Officer Suresh exists
    let sureshRes = await db.query(`SELECT id FROM users WHERE phone = '9111111111'`);
    let sureshId;
    if (sureshRes.rows.length === 0) {
      const ins = await db.query(
        `INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Officer Suresh', '9111111111', passwordHash, 'officer']
      );
      sureshId = ins.rows[0].id;
      console.log('Created Officer Suresh.');
    } else {
      sureshId = sureshRes.rows[0].id;
      console.log('Officer Suresh already exists.');
    }

    // 2. Ensure Officer Ramesh exists
    let rameshRes = await db.query(`SELECT id FROM users WHERE phone = '9222222222'`);
    let rameshId;
    if (rameshRes.rows.length === 0) {
      const ins = await db.query(
        `INSERT INTO users (name, phone, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Officer Ramesh', '9222222222', passwordHash, 'officer']
      );
      rameshId = ins.rows[0].id;
      console.log('Created Officer Ramesh.');
    } else {
      rameshId = rameshRes.rows[0].id;
      console.log('Officer Ramesh already exists.');
    }

    // 3. Assign them to all districts in the wards table (alternating)
    console.log('Assigning officers to all districts...');
    
    // Update even IDs to Ramesh
    const rameshUpdate = await db.query(
      `UPDATE wards SET officer_id = $1 WHERE id % 2 = 0`,
      [rameshId]
    );
    
    // Update odd IDs to Suresh
    const sureshUpdate = await db.query(
      `UPDATE wards SET officer_id = $1 WHERE id % 2 <> 0`,
      [sureshId]
    );

    console.log(`Successfully assigned Officer Ramesh to ${rameshUpdate.rowCount} districts.`);
    console.log(`Successfully assigned Officer Suresh to ${sureshUpdate.rowCount} districts.`);
    console.log('Officer assignment completed successfully!');
  } catch (e) {
    console.error('Failed to seed and assign officers:', e.message);
  } finally {
    process.exit(0);
  }
})();
