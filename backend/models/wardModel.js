const db = require('../config/db');

const WardModel = {
    // Get all wards (with officer + complaint counts)
    getAll: async () => {
        const r = await db.query(
            `SELECT w.*, u.name AS officer_name, u.phone AS officer_phone,
              COUNT(c.id) FILTER (WHERE c.status NOT IN ('resolved','rejected')) AS open_count,
              COUNT(c.id) AS total_count
       FROM wards w
       LEFT JOIN users u ON w.officer_id = u.id
       LEFT JOIN complaints c ON c.ward_id = w.ward_name
       GROUP BY w.id, u.name, u.phone
       ORDER BY w.ward_number`
        );
        return r.rows;
    },

    // Find ward by id
    findById: async (id) => {
        const r = await db.query(`SELECT * FROM wards WHERE id = $1`, [id]);
        return r.rows[0] || null;
    },

    // Assign officer to ward
    assignOfficer: async (wardId, officerId) => {
        await db.query(`UPDATE wards SET officer_id = $1 WHERE id = $2`, [officerId, wardId]);
    },

    // Find ward nearest to the given coordinates
    findByLocation: async (latitude, longitude) => {
        const r = await db.query(
            `SELECT * FROM wards
             WHERE latitude IS NOT NULL AND longitude IS NOT NULL
             ORDER BY ((latitude - $1)^2 + (longitude - $2)^2) ASC
             LIMIT 1`,
            [latitude, longitude]
        );
        return r.rows[0] || null;
    },
};

module.exports = WardModel;
