import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, register, googleLogin, requestOtp, verifyOtp, forgotPassword } from "../api";
import { showToast } from "../components/Toast";
import StateDistrictSelect from "../components/StateDistrictSelect";

export default function AuthCard({ initialTab = "login" }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab);

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [remember, setRemember] = useState(true);

  // Register state
  const [name, setName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regState, setRegState] = useState("");
  const [regDistrict, setRegDistrict] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // "SSO" = generic email + OTP login
  const [otpView, setOtpView] = useState(null); // null | 'email' | 'code'
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Forgot password
  const [forgotView, setForgotView] = useState(null); // null | 'email' | 'sent'
  const [forgotEmail, setForgotEmail] = useState("");

  // Google Identity Services token client
  const googleTokenClient = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.includes("your_google_oauth_client_id")) return;
    const init = () => {
      if (window.google?.accounts?.oauth2) {
        googleTokenClient.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: handleGoogleToken,
        });
      }
    };
    if (window.google?.accounts?.oauth2) init();
    else window.addEventListener("load", init);
    return () => window.removeEventListener("load", init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishLogin = (data, successMsg) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.dispatchEvent(new Event("user-updated"));
    showToast(successMsg, "success");
    setTimeout(() => {
      const role = data.user.role;
      if (role === "officer") navigate("/officer");
      else if (role === "admin") navigate("/admin");
      else navigate("/home");
    }, 400);
  };

  const handleGoogleToken = async (resp) => {
    if (!resp?.access_token) return showToast("Google sign-in was cancelled.", "info");
    setSubmitting(true);
    try {
      const res = await googleLogin(resp.access_token);
      finishLogin(res.data, "Signed in with Google!");
    } catch (err) {
      showToast(err.response?.data?.error || "Google sign-in failed.", "error");
    } finally { setSubmitting(false); }
  };

  const handleOtpRequest = async (e) => {
    e.preventDefault();
    if (!otpEmail) return;
    setSubmitting(true);
    try {
      await requestOtp(otpEmail);
      showToast("Code sent to your email", "success");
      setOtpView("code");
    } catch (err) {
      showToast(err.response?.data?.error || "Could not send code.", "error");
    } finally { setSubmitting(false); }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otpCode) return;
    setSubmitting(true);
    try {
      const res = await verifyOtp(otpEmail, otpCode);
      finishLogin(res.data, "Signed in!");
    } catch (err) {
      showToast(err.response?.data?.error || "Incorrect or expired code.", "error");
    } finally { setSubmitting(false); }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setSubmitting(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotView("sent");
    } catch {
      setForgotView("sent"); // same message either way, avoids leaking account existence
    } finally { setSubmitting(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    if (!loginPhone || !loginPassword) {
      setError("Enter your phone number and password to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await login({ phone: loginPhone, password: loginPassword });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("user-updated"));
      showToast("Welcome back!", "success");
      setTimeout(() => {
        const role = res.data.user.role;
        if (role === "officer") navigate("/officer");
        else if (role === "admin") navigate("/admin");
        else navigate("/home");
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name || !regPhone || !regPassword || !confirmPassword) {
      setError("Fill in all fields to create your account.");
      return;
    }
    if (!regState || !regDistrict) {
      setError("Please select your State/UT and District.");
      return;
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (regPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name, phone: regPhone, email: regEmail || undefined,
        password: regPassword, state: regState, district: regDistrict,
      });
      const res = await login({ phone: regPhone, password: regPassword });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("user-updated"));
      showToast("Account created!", "success");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialClick = (provider) => {
    if (provider === "Google") {
      if (!googleTokenClient.current) {
        return showToast("Google sign-in isn't configured yet (missing VITE_GOOGLE_CLIENT_ID).", "info");
      }
      return googleTokenClient.current.requestAccessToken();
    }
    if (provider === "SSO") {
      setOtpView("email");
      return;
    }
    showToast(`${provider} sign-in isn't set up yet.`, "info");
  };

  if (forgotView) {
    return (
      <div className="authpage-card" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="authpage-card-sheen" />
        <div className="authpage-card-head" style={{ marginBottom: '24px' }}>
          <div className="authpage-card-title" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            {forgotView === "sent" ? "Check your email" : "Reset your password"}
          </div>
          <div className="authpage-card-subtitle" style={{ fontSize: '14px', color: '#6F6F6F', marginTop: '4px' }}>
            {forgotView === "sent"
              ? "If an account exists for that email, a reset link is on its way."
              : "Enter the email linked to your account and we'll send you a reset link."}
          </div>
        </div>
        {forgotView === "email" ? (
          <form onSubmit={handleForgotSubmit} className="authpage-form-fade">
            <div className="authpage-field" style={{ marginBottom: '20px' }}>
              <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Email</label>
              <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '14px' }}>
                <input type="email" autoComplete="email" placeholder="you@example.com"
                  value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                  className="authpage-input" style={{ paddingLeft: '0px' }} required />
              </div>
            </div>
            <button type="submit" className="authpage-submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div style={{ fontSize: 40, textAlign: 'center', margin: '12px 0 20px' }}>📧</div>
        )}
        <div className="authpage-switch" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '18px' }}>
          <button type="button" onClick={() => setForgotView(null)} style={{ fontWeight: '600' }}>← Back to login</button>
        </div>
      </div>
    );
  }

  if (otpView) {
    return (
      <div className="authpage-card" style={{ fontFamily: 'var(--font-body)' }}>
        <div className="authpage-card-sheen" />
        <div className="authpage-card-head" style={{ marginBottom: '24px' }}>
          <div className="authpage-card-title" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Sign in with email code
          </div>
          <div className="authpage-card-subtitle" style={{ fontSize: '14px', color: '#6F6F6F', marginTop: '4px' }}>
            {otpView === "email"
              ? "Enter your account email — we'll send a 6-digit sign-in code."
              : `Enter the code we sent to ${otpEmail}.`}
          </div>
        </div>
        {otpView === "email" ? (
          <form onSubmit={handleOtpRequest} className="authpage-form-fade">
            <div className="authpage-field" style={{ marginBottom: '20px' }}>
              <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>Email</label>
              <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '14px' }}>
                <input type="email" autoComplete="email" placeholder="you@example.com"
                  value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                  className="authpage-input" style={{ paddingLeft: '0px' }} required />
              </div>
            </div>
            <button type="submit" className="authpage-submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="authpage-form-fade">
            <div className="authpage-field" style={{ marginBottom: '20px' }}>
              <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>6-digit code</label>
              <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '14px' }}>
                <input type="text" inputMode="numeric" maxLength={6} placeholder="123456"
                  value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="authpage-input" style={{ paddingLeft: '0px', letterSpacing: '4px' }} required />
              </div>
            </div>
            <button type="submit" className="authpage-submit" disabled={submitting}>
              {submitting ? "Verifying…" : "Verify & Sign In"}
            </button>
            <button type="button" onClick={() => setOtpView("email")} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', fontSize: '12.5px', marginTop: '14px', fontFamily: 'var(--font-body)'
            }}>
              Didn't get it? Resend
            </button>
          </form>
        )}
        <div className="authpage-switch" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '14px' }}>
          <button type="button" onClick={() => setOtpView(null)} style={{ fontWeight: '600' }}>← Back to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="authpage-card" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Soft floating light reflection sheen sweep */}
      <div className="authpage-card-sheen" />

      {/* Tab Switchers */}
      <div className="authpage-tabs">
        <button
          type="button"
          className={`authpage-tab ${tab === "login" ? "active" : ""}`}
          onClick={() => { setTab("login"); setError(null); }}
        >
          Login
        </button>
        <button
          type="button"
          className={`authpage-tab ${tab === "register" ? "active" : ""}`}
          onClick={() => { setTab("register"); setError(null); }}
        >
          Sign Up
        </button>
      </div>

      {/* Welcome Heading */}
      <div className="authpage-card-head" style={{ marginBottom: '28px' }}>
        <div>
          <div className="authpage-card-title" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            {tab === "login" ? "Welcome Back!" : "Create your account"}
          </div>
          <div className="authpage-card-subtitle" style={{ fontSize: '14px', color: '#6F6F6F', marginTop: '4px' }}>
            {tab === "login"
              ? "Sign in to continue to your account."
              : "Join Smart Cities India today."}
          </div>
        </div>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="authpage-form-fade">
          {/* Phone Number Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Phone Number</label>
            <div className="authpage-phone-row" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="authpage-country" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🇮🇳</span>
                <span>+91</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div className="authpage-input-wrap">
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter 10-digit number"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="authpage-input"
                  style={{ width: '100%', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Password</label>
            <div className="authpage-input-wrap-bordered">
              {/* Lock SVG on the Left */}
              <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showLoginPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="authpage-input"
              />
              {/* Eye SVG Toggle on the Right */}
              <button
                type="button"
                className="authpage-input-icon"
                onClick={() => setShowLoginPw((s) => !s)}
                aria-label={showLoginPw ? "Hide password" : "Show password"}
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                {showLoginPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot Row */}
          <div className="authpage-row-between" style={{ marginBottom: '24px' }}>
            <label className="authpage-checkbox-label" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember Me
            </label>
            <button type="button" onClick={() => { setForgotView("email"); setForgotEmail(""); }}
              className="authpage-link" style={{ fontSize: '13px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot Password?
            </button>
          </div>

          {error && <p className="authpage-error">{error}</p>}

          {/* Submit Button */}
          <button type="submit" className="authpage-submit" disabled={submitting}>
            {submitting ? "Signing in…" : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            )}
          </button>

          <div className="authpage-divider" style={{ margin: '24px 0 20px', color: 'rgba(255,255,255,0.45)' }}>or continue with</div>

          {/* Social Sign In 3-Column Grid */}
          <div className="authpage-social-grid" style={{ marginBottom: '24px' }}>
            {/* Google */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("Google")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/* Microsoft */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("Microsoft")}>
              <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h11v11H0z" fill="#F25022" />
                <path d="M12 0h11v11H12z" fill="#7FBA00" />
                <path d="M0 12h11v11H0z" fill="#00A4EF" />
                <path d="M12 12h11v11H12z" fill="#FFB900" />
              </svg>
              Microsoft
            </button>

            {/* SSO */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("SSO")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#06b6d4' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              SSO
            </button>
          </div>

          {/* Tab Switch Toggle */}
          <div className="authpage-switch" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            New to Smart Cities?{" "}
            <button type="button" onClick={() => { setTab("register"); setError(null); }} style={{ fontWeight: '600' }}>
              Create an account
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="authpage-form-fade">
          {/* Full Name Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Full Name</label>
            <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '14px' }}>
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="authpage-input"
                style={{ paddingLeft: '0px' }}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Phone Number</label>
            <div className="authpage-phone-row" style={{ display: 'flex', alignItems: 'center' }}>
              <div className="authpage-country" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🇮🇳</span>
                <span>+91</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              <div className="authpage-input-wrap">
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="Enter 10-digit number"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="authpage-input"
                  style={{ width: '100%', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* State / District Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>State &amp; District</label>
            <StateDistrictSelect
              state={regState}
              district={regDistrict}
              onChange={({ state, district }) => { setRegState(state); setRegDistrict(district); }}
            />
          </div>

          {/* Email Field (optional — enables login alerts, OTP sign-in, password reset) */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
              Email <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>(optional, for sign-in alerts &amp; password reset)</span>
            </label>
            <div className="authpage-input-wrap-bordered" style={{ paddingLeft: '14px' }}>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="authpage-input"
                style={{ paddingLeft: '0px' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="authpage-field" style={{ marginBottom: '20px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Password</label>
            <div className="authpage-input-wrap-bordered">
              {/* Lock SVG on the Left */}
              <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showRegPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="authpage-input"
              />
              {/* Eye SVG Toggle on the Right */}
              <button
                type="button"
                className="authpage-input-icon"
                onClick={() => setShowRegPw((s) => !s)}
                aria-label={showRegPw ? "Hide password" : "Show password"}
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                {showRegPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="authpage-field" style={{ marginBottom: '24px' }}>
            <label className="authpage-label" style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>Confirm Password</label>
            <div className="authpage-input-wrap-bordered">
              {/* Lock SVG on the Left */}
              <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="authpage-input"
              />
            </div>
          </div>

          {error && <p className="authpage-error">{error}</p>}

          {/* Submit Button */}
          <button type="submit" className="authpage-submit" disabled={submitting}>
            {submitting ? "Creating account…" : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                Create Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            )}
          </button>

          <div className="authpage-divider" style={{ margin: '24px 0 20px', color: 'rgba(255,255,255,0.45)' }}>or continue with</div>

          {/* Social Grid */}
          <div className="authpage-social-grid" style={{ marginBottom: '24px' }}>
            {/* Google */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("Google")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/* Microsoft */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("Microsoft")}>
              <svg width="16" height="16" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h11v11H0z" fill="#F25022" />
                <path d="M12 0h11v11H12z" fill="#7FBA00" />
                <path d="M0 12h11v11H0z" fill="#00A4EF" />
                <path d="M12 12h11v11H12z" fill="#FFB900" />
              </svg>
              Microsoft
            </button>

            {/* SSO */}
            <button type="button" className="authpage-social-btn" onClick={() => handleSocialClick("SSO")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#06b6d4' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              SSO
            </button>
          </div>

          {/* Switch Toggle */}
          <div className="authpage-switch" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
            Already have an account?{" "}
            <button type="button" onClick={() => { setTab("login"); setError(null); }} style={{ fontWeight: '600' }}>
              Sign in
            </button>
          </div>
        </form>
      )}
    </div>
  );
}