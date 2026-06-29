import { useEffect, useRef } from "react";

const BG_IMAGE = "/assets/smart-city-bg.png";

export default function AuthSidebar() {
  return (
    <aside className="authpage-sidebar">
      <img src={BG_IMAGE} alt="Smart Cities India" className="authpage-bg" />
      <div className="authpage-scrim" />
      <div className="authpage-glow" />

      {/* Floating Background Particles */}
      <div className="authpage-particle" style={{ top: '75%', left: '12%', animationDelay: '0s', animationDuration: '14s' }} />
      <div className="authpage-particle" style={{ top: '60%', left: '38%', animationDelay: '2.5s', animationDuration: '11s', width: '3px', height: '3px' }} />
      <div className="authpage-particle" style={{ top: '45%', left: '72%', animationDelay: '4.8s', animationDuration: '15s', width: '5px', height: '5px' }} />
      <div className="authpage-particle" style={{ top: '85%', left: '28%', animationDelay: '1.2s', animationDuration: '17s', width: '3px', height: '3px' }} />
      <div className="authpage-particle" style={{ top: '70%', left: '84%', animationDelay: '3.1s', animationDuration: '12s' }} />
      <div className="authpage-particle" style={{ top: '55%', left: '18%', animationDelay: '5.5s', animationDuration: '16s', width: '2px', height: '2px' }} />

      {/* Holographic IoT Network Connections (Responsive SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 2 }}>
        {/* Background static connecting lines */}
        <line x1="16" y1="23" x2="25" y2="32" className="data-flow-line" />
        <line x1="25" y1="32" x2="34" y2="19" className="data-flow-line" />
        <line x1="34" y1="19" x2="44" y2="13" className="data-flow-line" />
        <line x1="44" y1="13" x2="42" y2="26" className="data-flow-line" />
        <line x1="42" y1="26" x2="39" y2="31" className="data-flow-line" />
        <line x1="42" y1="26" x2="52" y2="28" className="data-flow-line" />
        <line x1="44" y1="13" x2="52" y2="28" className="data-flow-line" />

        {/* Animated flow pulses shooting across the network */}
        <line x1="16" y1="23" x2="25" y2="32" className="data-flow-pulse" />
        <line x1="25" y1="32" x2="34" y2="19" className="data-flow-pulse" style={{ animationDelay: '1s' }} />
        <line x1="34" y1="19" x2="44" y2="13" className="data-flow-pulse" style={{ animationDelay: '2s' }} />
        <line x1="44" y1="13" x2="42" y2="26" className="data-flow-pulse" style={{ animationDelay: '0.5s' }} />
        <line x1="42" y1="26" x2="39" y2="31" className="data-flow-pulse" style={{ animationDelay: '1.5s' }} />
        <line x1="42" y1="26" x2="52" y2="28" className="data-flow-pulse" style={{ animationDelay: '2.5s' }} />
        <line x1="44" y1="13" x2="52" y2="28" className="data-flow-pulse" style={{ animationDelay: '3s' }} />
      </svg>

      {/* Holographic IoT Nodes */}
      <div className="authpage-nodes-container" style={{ zIndex: 3 }}>
        {/* Node 1: IoT Sensors */}
        <div className="authpage-node" style={{ top: '23%', left: '16%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" />
          <div className="authpage-node-icon">📡 IoT Sensors</div>
        </div>

        {/* Node 2: Waste Management */}
        <div className="authpage-node" style={{ top: '32%', left: '25%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '0.5s' }} />
          <div className="authpage-node-icon">🗑️ Waste Management</div>
        </div>

        {/* Node 3: Smart Energy */}
        <div className="authpage-node" style={{ top: '19%', left: '34%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '1s' }} />
          <div className="authpage-node-icon">⚡ Smart Energy</div>
        </div>

        {/* Node 4: Public Management */}
        <div className="authpage-node" style={{ top: '31%', left: '39%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '1.5s' }} />
          <div className="authpage-node-icon">🏛️ Public Management</div>
        </div>

        {/* Node 5: Smart Mobility */}
        <div className="authpage-node" style={{ top: '26%', left: '42%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '0.8s' }} />
          <div className="authpage-node-icon">🚗 Smart Mobility</div>
        </div>

        {/* Node 6: IoT Hub */}
        <div className="authpage-node" style={{ top: '13%', left: '44%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '2.2s' }} />
          <div className="authpage-node-icon">🌐 IoT Hub</div>
        </div>

        {/* Node 7: Public Safety */}
        <div className="authpage-node" style={{ top: '28%', left: '52%' }}>
          <div className="authpage-node-core" />
          <div className="authpage-node-ring" style={{ animationDelay: '1.8s' }} />
          <div className="authpage-node-icon">🛡️ Public Safety</div>
        </div>
      </div>

      <div className="authpage-sidebar-inner">
        {/* Top Branding Header */}
        <div>
          <div className="authpage-logo">
            {/* Glowing skyline wireframe logo */}
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#00D4FF', filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.6))' }}>
              <path d="M6 34H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 34V18C10 17.4477 10.4477 17 11 17H15C15.5523 17 16 17.4477 16 18V34" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M16 34V10C16 9.44772 16.4477 9 17 9H23C23.5523 9 24 9.44772 24 10V34" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M24 34V22C24 21.4477 24.4477 21 25 21H29C29.5523 21 30 21.4477 30 22V34" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M13 21H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 25H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 29H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 13H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 17H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 21H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 25H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 29H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M27 25H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M27 29H28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="authpage-logo-text" style={{ fontFamily: 'var(--font-body)' }}>
              Smart Cities
              <span>INDIA</span>
            </div>
          </div>
        </div>

        {/* Main Header + Copy */}
        <div className="authpage-headline" style={{ fontFamily: 'var(--font-body)', position: 'relative', zIndex: 10 }}>
          <h1>
            Smart Cities.<br />
            <span className="accent">Stronger India.</span>
          </h1>
          <p className="authpage-desc" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginTop: '16px', maxWidth: '400px' }}>
            Connecting Citizens, Infrastructure and Intelligence.
          </p>
          <div className="authpage-badge-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00D4FF' }}>
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            AI-Powered City Operations Platform
          </div>
        </div>

        {/* Live City Overview Panel */}
        <div className="authpage-stats-card" style={{ fontFamily: 'var(--font-body)', position: 'relative', zIndex: 10 }}>
          <div className="authpage-stats-head">
            <div className="authpage-stats-title">
              <span className="pulse" />
              LIVE CITY OVERVIEW
            </div>
          </div>
          
          <div className="authpage-stats-grid">
            {/* Stat 1: Citizens */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <div className="authpage-stat-value">1.26B+</div>
              <div className="authpage-stat-label">Citizens Impacted</div>
            </div>

            {/* Stat 2: Active Vehicles */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </span>
              <div className="authpage-stat-value">98.7K+</div>
              <div className="authpage-stat-label">Active Vehicles</div>
            </div>

            {/* Stat 3: IoT Sensors */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                  <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                  <path d="M8.58 16.14a6 6 0 0 1 6.84 0"/>
                  <circle cx="12" cy="20" r="1"/>
                </svg>
              </span>
              <div className="authpage-stat-value">2.45M+</div>
              <div className="authpage-stat-label">IoT Sensors</div>
            </div>

            {/* Stat 4: AQI */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a7 7 0 0 1-10 10z"/>
                  <path d="M9 22a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9z"/>
                </svg>
              </span>
              <div className="authpage-stat-value">68%</div>
              <div className="authpage-stat-label">
                Air Quality Index<br />
                <span style={{ color: '#34d399', fontWeight: 600 }}>Good</span>
              </div>
            </div>

            {/* Stat 5: Energy Saved */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </span>
              <div className="authpage-stat-value">12.8 GW</div>
              <div className="authpage-stat-label">Energy Saved</div>
            </div>

            {/* Stat 6: Waste Processed */}
            <div className="authpage-stat">
              <span className="authpage-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </span>
              <div className="authpage-stat-value">45.6K+</div>
              <div className="authpage-stat-label">Tons Waste Processed</div>
            </div>
          </div>
        </div>

        {/* Footer info matching Image 1 exactly */}
        <div className="authpage-footer-tags" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.45)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>🛡️ Secure</span>
            <span>•</span>
            <span>Reliable</span>
            <span>•</span>
            <span>Intelligent</span>
          </div>
          <div>© 2025 Smart Cities India Mission. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>🇮🇳 Bharat</span>
            <span>•</span>
            <span>Smart</span>
            <span>•</span>
            <span>Sustainable</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
