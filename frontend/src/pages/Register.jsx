import AuthSidebar from "../components/AuthSidebar";
import AuthCard from "../components/AuthCard";
import "../styles/fonts.css";
import "../styles/theme.css";

export default function Register() {
  return (
    <div className="authpage-root">
      <AuthSidebar />
      <main className="authpage-content">
        {/* Language selector matching Image 1 */}
        <div className="authpage-lang-select">
          <span>🌐</span>
          <span>English</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" style={{ opacity: 0.8, marginTop: '1px' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        <AuthCard initialTab="register" />
      </main>
    </div>
  );
}
