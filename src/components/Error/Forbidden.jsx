import React from 'react';
import { useNavigate } from 'react-router-dom';
import { defineElement } from 'lord-icon-element';
import lottie from 'lottie-web';

defineElement(lottie.loadAnimation);

import './Forbidden.css';

const Forbidden = () => {
  const navigate = useNavigate(); 

  return (
    <div className="forbidden-container container-fluid">
      <h2>403 Forbidden</h2>
      <p>You do not have permission to access this page.</p>
      <div>
      <lord-icon
        src="https://cdn.lordicon.com/lltgvngb.json"
        trigger="in"
        state= "in-reveal"
        colors="primary:#c71f16,secondary:#c71f16"
        style={{ width: '150px', height: '150px' }}
      ></lord-icon>
      </div>

      <a className='visually-hidden' href="https://lordicon.com/">Icons by Lordicon.com</a>

      <button className="btn btn-sm btn-outline-danger" onClick={() => navigate('/')}>Go back</button>
    </div>
  );
};

export default Forbidden;
