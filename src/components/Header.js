import React from 'react';
import './Header.css';

const Header = ({ activeView, setActiveView }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">
            <span className="header-icon">🏥</span>
            Health Analyzer Dashboard
          </h1>
        </div>
        
        <nav className="header-nav">
          <button
            className={`nav-button ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </button>
          
          <button
            className={`nav-button ${activeView === 'add' ? 'active' : ''}`}
            onClick={() => setActiveView('add')}
          >
            <span className="nav-icon">➕</span>
            Add Health Record
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
