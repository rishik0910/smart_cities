const db = require('../config/db');

const ComplaintModel = {
    // Create complaint + initial history entry in one transaction
    create: async ({ user_id, ward_id, category, description, photo_url, latitude, longitude, address, priority, severity, estimated_days, is_emergency, state }) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const comp = await client.query(
                `INSERT INTO complaints (user_id, ward_id, category, description, photo_url, latitude, longitude, address, priority, severity, estimated_days, is_emergency, state)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
                [user_id, ward_id, category, description, photo_url, latitude, longitude, address, priority, severity, estimated_days, is_emergency, state]
            );
            const complaintId = comp.rows[0].id;
            const code = 'WST-' + String(complaintId).padStart(4, '0');
            await client.query(
                `UPDATE complaints SET complaint_code = $1 WHERE id = $2`,
                [code, complaintId]
            );
            comp.rows[0].complaint_code = code;
            await client.query(
                `INSERT INTO complaint_history (complaint_id, changed_by, new_status) VALUES ($1,$2,'pending')`,
                [complaintId, user_id]
            );
            await client.query('COMMIT');
            return comp.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // All complaints for one citizen
    findByUser: async (userId) => {
        const r = await db.query(
            `SELECT c.*, w.ward_name FROM complaints c
       LEFT JOIN wards w ON c.ward_id = w.ward_name
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
            [userId]
        );
        return r.rows;
    },

    // Single complaint by id
    findById: async (id) => {
        const r = await db.query(`SELECT * FROM complaints WHERE id = $1`, [id]);
        return r.rows[0] || null;
    },

    // Complaint history (audit trail)
    getHistory: async (complaintId) => {
        const r = await db.query(
            `SELECT h.*, u.name AS changed_by_name
       FROM complaint_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.complaint_id = $1
       ORDER BY h.changed_at ASC`,
            [complaintId]
        );
        return r.rows;
    },

    // Ward complaints (for officer) — optional status filter
    findByWard: async (wardId, status = null) => {
        let q = `SELECT c.*, u.name AS citizen_name, u.phone AS citizen_phone
             FROM complaints c
             JOIN users u ON c.user_id = u.id
             WHERE c.ward_id = $1`;
        const params = [wardId];
        if (status) { params.push(status); q += ` AND c.status = $2`; }
        q += ` ORDER BY c.created_at DESC`;
        const r = await db.query(q, params);
        return r.rows;
    },

    // Update status + write history — single transaction
    updateStatus: async ({ complaintId, newStatus, changedBy, note }) => {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const old = await client.query(`SELECT status FROM complaints WHERE id = $1`, [complaintId]);
            const oldStatus = old.rows[0]?.status;
            const resolvedAt = newStatus === 'resolved' ? ', resolved_at = NOW()' : '';
            await client.query(
                `UPDATE complaints
         SET status = $1, assigned_to = $2, resolution_note = $3, updated_at = NOW()${resolvedAt}
         WHERE id = $4`,
                [newStatus, changedBy, note, complaintId]
            );
            await client.query(
                `INSERT INTO complaint_history (complaint_id, changed_by, old_status, new_status, note)
         VALUES ($1,$2,$3,$4,$5)`,
                [complaintId, changedBy, oldStatus, newStatus, note]
            );
            await client.query('COMMIT');
            return { oldStatus };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // Admin: all complaints with filters + pagination
    findAll: async ({ ward_id, status, category, from, to, page = 1, limit = 20 }) => {
        const conditions = [];
        const params = [];

        if (ward_id) {
            params.push(ward_id);
            if (/^\d+$/.test(ward_id)) {
                conditions.push(`EXISTS (SELECT 1 FROM wards WHERE wards.ward_name = c.ward_id AND wards.id = $${params.length})`);
            } else {
                conditions.push(`c.ward_id = $${params.length}`);
            }
        }
        if (status) { params.push(status); conditions.push(`c.status    = $${params.length}`); }
        if (category) { params.push(category); conditions.push(`c.category  = $${params.length}`); }
        if (from) { params.push(from); conditions.push(`c.created_at >= $${params.length}`); }
        if (to) { params.push(to); conditions.push(`c.created_at <= $${params.length}`); }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        const countRes = await db.query(`SELECT COUNT(*) FROM complaints c ${where}`, params);
        const rows = await db.query(
            `SELECT c.*, w.ward_name, u.name AS citizen_name, u.phone AS citizen_phone, o.name AS officer_name
       FROM complaints c
       LEFT JOIN wards w ON c.ward_id     = w.ward_name
       LEFT JOIN users u ON c.user_id     = u.id
       LEFT JOIN users o ON c.assigned_to = o.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        );

        return {
            complaints: rows.rows,
            total: parseInt(countRes.rows[0].count),
            page,
            pages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
        };
    },

    // Admin stats
    getStats: async () => {
        const [total, pending, resolved, resolvedToday, avgTime, perWard, perCategory, avgRating, perState] = await Promise.all([
            db.query(`SELECT COUNT(*) FROM complaints`),
            db.query(`SELECT COUNT(*) FROM complaints WHERE status = 'pending'`),
            db.query(`SELECT COUNT(*) FROM complaints WHERE status = 'resolved'`),
            db.query(`SELECT COUNT(*) FROM complaints WHERE status='resolved' AND resolved_at::date = CURRENT_DATE`),
            db.query(`SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600)::numeric,1) AS avg_hours FROM complaints WHERE status='resolved' AND resolved_at IS NOT NULL`),
            db.query(`SELECT w.ward_name, w.ward_number,
                  COUNT(c.id) AS total,
                  COUNT(c.id) FILTER (WHERE c.status='resolved')    AS resolved,
                  COUNT(c.id) FILTER (WHERE c.status='pending')     AS pending,
                  COUNT(c.id) FILTER (WHERE c.status='in_progress') AS in_progress
                FROM wards w LEFT JOIN complaints c ON c.ward_id = w.ward_name
                GROUP BY w.id ORDER BY w.ward_number`),
            db.query(`SELECT category, COUNT(*) AS count FROM complaints GROUP BY category ORDER BY count DESC`),
            db.query(`SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM complaints WHERE rating IS NOT NULL`),
            db.query(`SELECT COALESCE(state, 'Unknown') AS state_name,
                  COUNT(id) AS total,
                  COUNT(id) FILTER (WHERE status='resolved')    AS resolved,
                  COUNT(id) FILTER (WHERE status='pending')     AS pending,
                  COUNT(id) FILTER (WHERE status='in_progress') AS in_progress
                FROM complaints
                GROUP BY state ORDER BY total DESC`),
        ]);

        return {
            total: parseInt(total.rows[0].count),
            pending: parseInt(pending.rows[0].count),
            resolved: parseInt(resolved.rows[0].count),
            resolvedToday: parseInt(resolvedToday.rows[0].count),
            avgHours: parseFloat(avgTime.rows[0].avg_hours) || 0,
            perWard: perWard.rows,
            perCategory: perCategory.rows,
            avgRating: parseFloat(avgRating.rows[0].avg_rating) || 0,
            perState: perState.rows,
        };
    },
};

module.exports = ComplaintModel;