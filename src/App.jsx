import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Routes, Route, Navigate } from "react-router-dom";
import DataForm from "./components/DataForm";
import POView from "./components/POView";
import POForm from "./components/POForm";
import ErrorBoundary from "./components/ErrorBoundary"; 
import Login from "./components/Login/Login";
import Home from "./components/Home"; 
import Forbidden from "./components/Error/Forbidden";
import SavedEntries from "./components/SavedEntries";
import NotFound from "./components/Error/PageNotFound"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(""); 

  useEffect(() => {
    const cookie = Cookies.get("auth");
    if (cookie) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    Cookies.remove("auth"); 
  };

  return (
    <div className="App">
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

        <Route path="/entries" element={
          isLoggedIn ? (
            <ErrorBoundary>
              <SavedEntries/>
            </ErrorBoundary>
          ) : (
            <Navigate to="/forbidden" />
          )
        } />

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
         <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
