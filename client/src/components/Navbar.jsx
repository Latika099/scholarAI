import React, { useState } from 'react';
import { useScholarship } from '../context/ScholarshipContext';
import { 
  GraduationCap, 
  Search, 
  UserCheck, 
  Sparkles, 
  Bookmark, 
  MessageSquareCode, 
  Menu, 
  X 
} from 'lucide-react';

export default function Navbar() {
  const { currentView, setCurrentView, savedIds, profile } = useScholarship();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'discovery', label: 'Discover', icon: Search },
    { id: 'matches', label: 'AI Matching', icon: Sparkles, highlight: true },
    { id: 'profile', label: 'Student Profile', icon: UserCheck },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedIds.length },
    { id: 'assistant', label: 'Copilot Chat', icon: MessageSquareCode }
  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header-nav">
      <div className="nav-inner">
        {/* Brand */}
        <div 
          className="brand-logo" 
          onClick={() => handleNavClick('home')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon">
            <GraduationCap size={24} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <h1>ScholarAI</h1>
            <p className="brand-tagline">Multi-Agent Scholarship Copilot</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                style={item.highlight && !isActive ? { color: 'var(--primary-600)', fontWeight: 600 } : {}}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span 
                    style={{
                      background: 'var(--primary-600)',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      marginLeft: '0.2rem'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none' }}
          aria-label="Toggle menu"
          id="mobile-nav-toggle-btn"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div 
          style={{
            background: 'white',
            borderBottom: '1px solid var(--border-light)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span 
                    style={{
                      background: 'var(--primary-600)',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '10px',
                      marginLeft: 'auto'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
