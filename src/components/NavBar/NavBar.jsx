import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg bg-none">
      <div className="container-fluid ">
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon">  </span>
        </button>
        
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/home') ? 'active' : ''}`} 
                to="/home"
              >
                Home
                {isActive('/home') && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/generate-pr') ? 'active' : ''}`} 
                to="/generate-pr/data-form"
              >
                Form
                {isActive('/generate-pr') && <span className="active-indicator"></span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/entries') ? 'active' : ''}`} 
                to="/entries"
              >
                Saved Entries
                {isActive('/entries') && <span className="active-indicator"></span>}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
