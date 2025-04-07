import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ setIsLoggedIn }) => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

useEffect(() => {
  const cookie = Cookies.get('auth');
  if (cookie) {
    setIsLoggedIn(true);
    navigate('/home');
  }
}, [navigate]);

const handleLogin = (e) => {
  Cookies.set('auth', 'authenticated', { expires: 0.0208 }); // 30 minutes

    e.preventDefault();
    if (username === 'mimaropa@01' && password === 'mimaropa@01') {
      setIsLoggedIn(true);
      navigate('/home');


    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
