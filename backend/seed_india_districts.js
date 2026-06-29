require('dotenv').config({ path: 'c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/.env' });
const db = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/config/db');
const indiaStatesDistricts = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/data/indiaStatesDistricts.json');

(async () => {
  try {
    console.log('Starting migration and seeding...');
    
    // 1. Add state column to wards table
    await db.query(`
      ALTER TABLE wards 
      ADD COLUMN IF NOT EXISTS state VARCHAR(100);
    `);
    console.log('Added "state" column to wards table.');

    // 2. Remove unique constraint on ward_number if it exists
    await db.query(`
      ALTER TABLE wards 
      DROP CONSTRAINT IF EXISTS wards_ward_number_key;
    `);
    console.log('Adjusted ward_number constraint.');

    // 3. Fetch existing wards to prevent duplicates
    const existingRes = await db.query(`SELECT id, ward_name, state FROM wards`);
    const existingMap = new Set(
      existingRes.rows.map(r => `${r.ward_name.toLowerCase()}|${(r.state || '').toLowerCase()}`)
    );

    // 4. Loop and insert all districts of India
    let insertedCount = 0;
    let wardNumberCounter = 100;

    for (const [stateName, districts] of Object.entries(indiaStatesDistricts)) {
      for (const districtName of districts) {
        const key = `${districtName.toLowerCase()}|${stateName.toLowerCase()}`;
        
        if (!existingMap.has(key)) {
          wardNumberCounter++;
          await db.query(
            `INSERT INTO wards (ward_number, ward_name, state) VALUES ($1, $2, $3)`,
            [wardNumberCounter, districtName, stateName]
          );
          insertedCount++;
        } else {
          // Update state column for existing matching ward name if it was null
          await db.query(
            `UPDATE wards SET state = $1 WHERE LOWER(ward_name) = $2 AND state IS NULL`,
            [stateName, districtName.toLowerCase()]
          );
        }
      }
    }

    console.log(`Seeding completed successfully! Inserted ${insertedCount} new districts.`);
  } catch (e) {
    console.error('Seeding failed:', e.message);
  } finally {
    process.exit(0);
  }
})();
