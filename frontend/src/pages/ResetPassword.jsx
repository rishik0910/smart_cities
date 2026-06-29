import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../api';
import { showToast } from '../components/Toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) { setError('This reset link is missing its token.'); return; }
    if (pwd.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (pwd !== confirm) { setError("Passwords don't match."); return; }
    setSubmitting(true);
    try {
      await resetPassword(token, pwd);
      setDone(true);
      showToast('Password updated!', 'success');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password. The link may have expired.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--sand-50)' }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--sand-100)', borderRadius: 'var(--radius)',
        padding: '32px 28px', maxWidth: 380, width: '100%' }}>
        {done ? (
          <>
            <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>Password updated</div>
            <div style={{ fontSize: 13, color: 'var(--sand-600)', textAlign: 'center', marginBottom: 20 }}>
              You can now sign in with your new password.
            </div>
            <button className="btn btn-green btn-md" style={{ width: '100%' }} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Set a new password</div>
            <div style={{ fontSize: 13, color: 'var(--sand-600)', marginBottom: 20 }}>
              Choose a new password for your account.
            </div>
            <form onSubmit={handleSubmit}>
              <input type="password" className="form-input" placeholder="New password (min 6 characters)"
                value={pwd} onChange={(e) => setPwd(e.target.value)} style={{ marginBottom: 10 }} />
              <input type="password" className="form-input" placeholder="Confirm new password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ marginBottom: 14 }} />
              {error && <p className="authpage-error" style={{ marginBottom: 12, color: '#DC2626', fontSize: 12.5 }}>{error}</p>}
              <button type="submit" className="btn btn-green btn-md" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Updating…' : 'Update Password'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login" style={{ fontSize: 12.5, color: 'var(--sand-400)' }}>← Back to login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
