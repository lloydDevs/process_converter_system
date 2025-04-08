import React from "react";
import { Link } from "react-router-dom";

import "./NavBar.css"; // Assuming we will create a CSS file for styling

const NavBar = () => {
  return (
    <nav className="navbar bg-primary">
      <ul>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/generate-pr/data-form">Form</Link>
        </li>
        <li>
          <Link to="/">About</Link>
        </li>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/entries">Saved Entries</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
