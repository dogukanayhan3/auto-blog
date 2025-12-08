import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from "lucide-react"; // <-- icon added
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Auto Blog</h1>
        </Link>
        
        <nav>
          <Link to="/" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={20} />
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;