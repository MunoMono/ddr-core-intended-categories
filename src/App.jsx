import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Theme } from "@carbon/react";
import HeaderBar from "./components/HeaderBar";
import Crumb from "./components/Crumb";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import People from "./pages/People";
import "./styles/index.scss";

function App() {
  const [theme, setTheme] = useState("g10"); // g10 = light theme
  const toggleTheme = () => setTheme((t) => (t === "g10" ? "g90" : "g10"));

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
            <Route path="/projects" element={<Projects />} />
            <Route path="/people" element={<People />} />
          </Routes>
        </main>
      </Router>
    </Theme>
  );
}

export default App;