import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeaderBar from "./components/HeaderBar";
import Crumb from "./components/Crumb";
import Home from "./pages/Home";
import { Theme } from "@carbon/react";
import "./styles/index.scss";

function App() {
  const [theme, setTheme] = useState("g10"); // g10 = light theme

  const toggleTheme = () => {
    setTheme((prev) => (prev === "g10" ? "g90" : "g10"));
  };

  // update data-theme attribute for SCSS variables
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <Theme theme={theme}>
      <Router>
        <HeaderBar theme={theme} toggleTheme={toggleTheme} />
        <main style={{ marginTop: "3rem" }}>
          <Crumb />
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </Router>
    </Theme>
  );
}

export default App;