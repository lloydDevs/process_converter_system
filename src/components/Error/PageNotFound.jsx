// NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return(
        <div className="container d-flex flex-column justify-content-center align-items-center">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for does not exist.</p>
            <button className="btn btn-sm btn-outline-primary" onClick={() => navigate('/')}>Go back</button>
        </div>
    )
}
export default NotFound;
  