import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ onLogout }) => {
  return (
    <div className='container'>
      <h2 className='d-flex justify-content-center'>Home Page</h2>
      <p className='d-flex justify-content-center'>Welcome to the home page!</p>
      <div className="d-flex justify-content-center">
        <Link to="/generate-pr/data-form">
          <button className='btn btn-outline-success me-2'>Generate PR</button>
        </Link>
        <button onClick={onLogout} className='btn btn-outline-secondary'>Logout</button>
      </div>
    </div>
  );
};


export default Home;
