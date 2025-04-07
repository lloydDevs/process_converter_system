import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importing BrowserRouter
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css"; // Importing Bootstrap CSS

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* Wrapping App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
