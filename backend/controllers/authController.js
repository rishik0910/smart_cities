const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const UserModel = require('../models/userModel');
const mailer = require('../utils/mailer');

const signToken = (user) => jwt.sign(
    { id: user.id, role: user.role, ward_id: user.ward_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

const userPayload = (user) => ({
    id: user.id, name: user.name, phone: user.phone,
    email: user.email, role: user.role, ward_id: user.ward_id,
    state: user.state, district: user.district,
    latitude: user.latitude, longitude: user.longitude
});

exports.register = async (req, res) => {
    const { name, phone, email, password, state, district } = req.body;
    if (!name || !phone || !password)
        return res.status(400).json({ error: 'Name, phone and password are required' });
    if (!state || !district)
        return res.status(400).json({ error: 'State/UT and district are required' });
    try {
        // Look up geographic coordinates and ward ID for the selected district
        let lat = null, lng = null, wardId = null;
        const wardRes = await db.query(
            `SELECT id, latitude, longitude FROM wards WHERE LOWER(ward_name) = LOWER($1) LIMIT 1`,
            [district.trim()]
        );
        if (wardRes.rows.length > 0) {
            wardId = wardRes.rows[0].id;
            lat = parseFloat(wardRes.rows[0].latitude);
            lng = parseFloat(wardRes.rows[0].longitude);
            if (isNaN(lat)) lat = null;
            if (isNaN(lng)) lng = null;
        }

        // If coordinates are not found in the database, fetch them dynamically from Open-Meteo Geocoding API
        if (lat === null || lng === null) {
            try {
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district.trim())}&count=10&language=en&format=json`;
                const geoRes = await fetch(geoUrl);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.results && geoData.results.length > 0) {
                        const bestMatch = geoData.results.find(res => 
                            (res.country_code === 'IN' || res.country === 'India') &&
                            (!state || res.admin1?.toLowerCase() === state.toLowerCase())
                        ) || geoData.results.find(res => res.country_code === 'IN' || res.country === 'India')
                          || geoData.results[0];
                        if (bestMatch) {
                            lat = parseFloat(bestMatch.latitude);
                            lng = parseFloat(bestMatch.longitude);
                        }
                    }
                }
            } catch (geoErr) {
                console.error('Backend geocoding failed during registration:', geoErr.message);
            }
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ 
            name, phone, email: email || null, password: hashed, 
            state, district, latitude: lat, longitude: lng, ward_id: wardId 
        });
        res.status(201).json({ user: userPayload(user) });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Phone or email already registered' });
        res.status(500).json({ error: 'Registration failed' });
    }
};

exports.login = async (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
    try {
        const user = await UserModel.findByPhone(phone);
        if (!user) return res.status(404).json({ error: 'No account found with this phone number' });
        if (!user.password) return res.status(400).json({ error: 'This account uses Google or email sign-in. Try that instead, or set a password from Forgot Password.' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Wrong password' });
        const token = signToken(user);
        mailer.sendLoginAlert(user).catch(() => { });
        res.json({ token, user: userPayload(user) });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, email, state, district } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    try {
        await db.query(
            'UPDATE users SET name = $1, email = $2, state = $3, district = $4 WHERE id = $5',
            [name.trim(), email?.trim() || null, state || null, district || null, req.user.id]
        );
        res.json({ message: 'Profile updated' });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'That email is already in use' });
        res.status(500).json({ error: 'Update failed' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    try {
        const result = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const match = await bcrypt.compare(currentPassword, result.rows[0].password);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
        res.json({ message: 'Password changed' });
    } catch { res.status(500).json({ error: 'Password change failed' }); }
};

// ---- Google Sign-In ----
exports.googleLogin = async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Missing Google access token' });
    try {
        const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
        const tokenInfo = await tokenInfoRes.json();
        if (!tokenInfoRes.ok || tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = await profileRes.json();
        const { sub: googleId, email, name } = profile;
        if (!email) return res.status(400).json({ error: 'Google account has no email' });

        let user = await UserModel.findByGoogleId(googleId);
        if (!user) {
            user = await UserModel.findByEmail(email);
            if (user) await UserModel.linkGoogleId(user.id, googleId);
            else user = await UserModel.createGoogleUser({ name, email, googleId });
        }
        const token = signToken(user);
        mailer.sendLoginAlert(user).catch(() => { });
        res.json({ token, user: userPayload(user) });
    } catch (err) {
        console.error('Google login failed:', err.message);
        res.status(500).json({ error: 'Google sign-in failed' });
    }
};

// ---- Email OTP login ("SSO") ----
exports.requestOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    try {
        const user = await UserModel.findByEmail(email);
        if (!user) return res.status(404).json({ error: 'No account found with this email' });
        const code = String(Math.floor(100000 + Math.random() * 900000));
        await UserModel.setOtp(user.id, code, new Date(Date.now() + 10 * 60 * 1000));
        const sent = await mailer.sendOtpEmail(email, code);
        if (!sent) return res.status(500).json({ error: 'Could not send email. Check email server configuration.' });
        res.json({ message: 'Verification code sent to your email' });
    } catch { res.status(500).json({ error: 'Could not send code' }); }
};

exports.verifyOtp = async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });
    try {
        const user = await UserModel.findByEmail(email);
        if (!user || !user.otp_code) return res.status(401).json({ error: 'Invalid or expired code' });
        if (new Date(user.otp_expiry) < new Date()) return res.status(401).json({ error: 'Code expired. Request a new one.' });
        if (user.otp_code !== code) return res.status(401).json({ error: 'Incorrect code' });
        await UserModel.clearOtp(user.id);
        const token = signToken(user);
        mailer.sendLoginAlert(user).catch(() => { });
        res.json({ token, user: userPayload(user) });
    } catch { res.status(500).json({ error: 'Verification failed' }); }
};

// ---- Forgot / reset password ----
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    try {
        const user = await UserModel.findByEmail(email);
        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            await UserModel.setResetToken(user.id, token, new Date(Date.now() + 30 * 60 * 1000));
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await mailer.sendResetEmail(email, resetLink);
        }
        // Always return success to avoid leaking which emails are registered
        res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
    } catch { res.status(500).json({ error: 'Could not process request' }); }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6)
        return res.status(400).json({ error: 'A valid token and a password of at least 6 characters are required' });
    try {
        const user = await UserModel.findByResetToken(token);
        if (!user) return res.status(400).json({ error: 'Reset link is invalid or has expired' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await UserModel.updatePasswordAndClearToken(user.id, hashed);
        res.json({ message: 'Password updated. You can now sign in.' });
    } catch { res.status(500).json({ error: 'Could not reset password' }); }
};