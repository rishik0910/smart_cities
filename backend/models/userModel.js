const db = require('../config/db');

const UserModel = {
    // Find user by phone
    findByPhone: async (phone) => {
        const r = await db.query(`SELECT * FROM users WHERE phone = $1`, [phone]);
        return r.rows[0] || null;
    },

    // Find user by id
    findById: async (id) => {
        const r = await db.query(`SELECT id, name, phone, email, role, ward_id, state, district, latitude, longitude FROM users WHERE id = $1`, [id]);
        return r.rows[0] || null;
    },

    // Create new user
    create: async ({ name, phone, email, password, state, district, latitude, longitude, ward_id }) => {
        const r = await db.query(
            `INSERT INTO users (name, phone, email, password, state, district, latitude, longitude, ward_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, phone, email, role, state, district, latitude, longitude, ward_id`,
            [name, phone, email, password, state || null, district || null, latitude || null, longitude || null, ward_id || null]
        );
        return r.rows[0];
    },

    // Get all officers (for admin)
    getAllOfficers: async () => {
        const r = await db.query(
            `SELECT id, name, phone, ward_id FROM users WHERE role = 'officer' ORDER BY name`
        );
        return r.rows;
    },

    // Update ward assignment
    setWard: async (userId, wardId) => {
        await db.query(`UPDATE users SET ward_id = $1 WHERE id = $2`, [wardId, userId]);
    },

    // ---- Email / Google / OTP / Reset additions ----

    findByEmail: async (email) => {
        const r = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return r.rows[0] || null;
    },

    findByGoogleId: async (googleId) => {
        const r = await db.query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);
        return r.rows[0] || null;
    },

    createGoogleUser: async ({ name, email, googleId }) => {
        const r = await db.query(
            `INSERT INTO users (name, email, google_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, phone, email, role, ward_id`,
            [name, email, googleId]
        );
        return r.rows[0];
    },

    linkGoogleId: async (userId, googleId) => {
        await db.query(`UPDATE users SET google_id = $1 WHERE id = $2`, [googleId, userId]);
    },

    updateEmail: async (userId, email) => {
        await db.query(`UPDATE users SET email = $1 WHERE id = $2`, [email, userId]);
    },

    setOtp: async (userId, code, expiry) => {
        await db.query(`UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3`, [code, expiry, userId]);
    },

    clearOtp: async (userId) => {
        await db.query(`UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = $1`, [userId]);
    },

    setResetToken: async (userId, token, expiry) => {
        await db.query(`UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3`, [token, expiry, userId]);
    },

    findByResetToken: async (token) => {
        const r = await db.query(
            `SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
            [token]
        );
        return r.rows[0] || null;
    },

    updatePasswordAndClearToken: async (userId, hashedPassword) => {
        await db.query(
            `UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2`,
            [hashedPassword, userId]
        );
    },
};

module.exports = UserModel;
