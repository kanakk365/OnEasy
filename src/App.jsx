import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AUTH_CONFIG } from "./config/auth";

function App() {
  console.log(AUTH_CONFIG.API_BASE_URL);
  console.log(AUTH_CONFIG.ENDPOINTS.PHONE_LOGIN);

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
