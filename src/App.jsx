import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Routes, Route, Navigate } from "react-router-dom";
import DataForm from "./components/DataForm";
import POView from "./components/POView";
import POForm from "./components/POForm";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary
import Login from "./components/Login/Login";
import Home from "./components/Home"; // Assuming you have a Home component
import Forbidden from "./components/Error/Forbidden";
import ChedLogo from "./assets/CHED-LOGO_orig.png";
import SavedEntries from "./components/SavedEntries";

console.log("App component is rendering"); // Log when the App component renders
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(""); // State to manage login status

  useEffect(() => {
    const cookie = Cookies.get("auth");
    if (cookie) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  console.log("Login status:", isLoggedIn); // Log the login status
  const handleLogout = () => {
    setIsLoggedIn(false);
    Cookies.remove("auth"); // Remove the cookie on logout
  };

  const logoStyle = {
    width: "70px",
    height: "70px",
    margin: "10px",
  };

  return (
    <div className="App">
      <div>
        <img src={ChedLogo} alt="no logo" style={logoStyle} />
      </div>
      <Routes>
        <Route
          path="/"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
          onEnter={() => console.log("Navigating to Login")}
        />
        <Route
          path="/home"
          element={
            isLoggedIn ? (
              <Home onLogout={handleLogout} />
            ) : (
              <Navigate to="/forbidden" />
            )
          }
        />
        <Route
          path="generate-pr/data-form"
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <DataForm />
              </ErrorBoundary>
            ) : (
              <Navigate to="/forbidden" />
            )
          }
        />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/entries" element={<SavedEntries />} />
        <Route 
          path="/po-view" 
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <POView />
              </ErrorBoundary>
            ) : (
              <Navigate to="/forbidden" />
            )
          } 
        />
        <Route 
          path="/create-po" 
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <POForm />
              </ErrorBoundary>
            ) : (
              <Navigate to="/forbidden" />
            )
          } 
        />
        <Route 
          path="/edit-po" 
          element={
            isLoggedIn ? (
              <ErrorBoundary>
                <POForm />
              </ErrorBoundary>
            ) : (
              <Navigate to="/forbidden" />
            )
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
