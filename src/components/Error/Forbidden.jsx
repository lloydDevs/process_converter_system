import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Forbidden.css';

const Forbidden = () => {
  const navigate = useNavigate(); 

  return (
    <div className="forbidden-container container-fluid">
      <h2>403 Forbidden</h2>
      <p>You do not have permission to access this page.</p>
      <button className="btn btn-sm btn-outline-danger" onClick={() => navigate('/')}>Go back</button>
    </div>
  );
};

export default Forbidden;
