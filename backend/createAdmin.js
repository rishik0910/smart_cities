require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

async function createAdmin() {

  // ── SET YOUR ADMIN CREDENTIALS HERE ──────────────────────
  const name = 'Admin';
  const phone = '9014688922';   // ← your admin phone number
  const password = 'Admin@123';   // ← your admin password
  // ─────────────────────────────────────────────────────────

  try {
    console.log('⏳ Creating admin account...');
    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, phone, password, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (phone)
       DO UPDATE SET role = 'admin', password = $3, name = $1`,
      [name, phone, hashed]
    );

    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log('──────────────────────────────────────');
    console.log('   Phone:   ', phone);
    console.log('   Password:', password);
    console.log('   Role:     admin');
    console.log('──────────────────────────────────────');
    console.log('');
    console.log('👉 Login at: http://localhost:5173/login');
    console.log('👉 Admin panel: http://localhost:5173/admin');
    console.log('');
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    process.exit();
  }
}

createAdmin();
