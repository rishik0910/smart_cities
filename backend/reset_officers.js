require('dotenv').config({ path: 'c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/.env' });
const db = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/config/db');
const bcrypt = require('c:/Users/Rishik/.gemini/antigravity/scratch/smart_cities/backend/node_modules/bcrypt');

(async () => {
  try {
    console.log('Resetting officer passwords...');
    const passwordHash = await bcrypt.hash('Officer@123', 10);

    // Update Suresh
    const resSuresh = await db.query(
      `UPDATE users SET password = $1 WHERE phone = '9111111111' AND role = 'officer' RETURNING id`,
      [passwordHash]
    );
    if (resSuresh.rowCount > 0) {
      console.log('Successfully reset password for Officer Suresh (9111111111) to Officer@123');
    } else {
      console.log('Officer Suresh not found or not an officer.');
    }

    // Update Ramesh
    const resRamesh = await db.query(
      `UPDATE users SET password = $1 WHERE phone = '9222222222' AND role = 'officer' RETURNING id`,
      [passwordHash]
    );
    if (resRamesh.rowCount > 0) {
      console.log('Successfully reset password for Officer Ramesh (9222222222) to Officer@123');
    } else {
      console.log('Officer Ramesh not found or not an officer.');
    }

  } catch (e) {
    console.error('Password reset failed:', e.message);
  } finally {
    process.exit(0);
  }
})();
