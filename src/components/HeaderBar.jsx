import React from "react";
import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
} from "@carbon/react";
import { Moon, Sun } from "@carbon/icons-react";

function HeaderBar({ theme, toggleTheme }) {
  const isDark = theme === "g90";
  const base = import.meta.env.BASE_URL || "/";

  return (
    <Header aria-label="DDR Core Intended Categories">
      <HeaderName href={base} prefix="">
        Graham Newman ddr core (intended) categories
      </HeaderName>
      <HeaderGlobalBar>
        <HeaderGlobalAction
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggleTheme}
          tooltipAlignment="end"
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
        </HeaderGlobalAction>
      </HeaderGlobalBar>
    </Header>
  );
}

export default HeaderBar;