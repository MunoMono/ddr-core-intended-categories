import React from "react";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavMenuItem,
} from "@carbon/react";
import { Moon, Sun } from "@carbon/icons-react";
import { Link, useLocation } from "react-router-dom";

export default function HeaderBar({ theme, toggleTheme }) {
  const isDark = theme === "g90";
  const location = useLocation();
  const base = import.meta.env.BASE_URL || "/";

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="DDR Core Intended Categories">
            {/* Hamburger (hidden on desktop via CSS) */}
            <HeaderMenuButton
              aria-label="Open menu"
              isActive={isSideNavExpanded}
              onClick={onClickSideNavExpand}
              className="mobile-menu-btn"
            />

            <HeaderName href={base} prefix="DDR">
              categories
            </HeaderName>

            {/* Desktop top-nav */}
            <HeaderNavigation aria-label="DDR navigation">
              <HeaderMenuItem as={Link} to="/" isActive={location.pathname === "/"}>
                Home
              </HeaderMenuItem>
              <HeaderMenuItem
                as={Link}
                to="/projects"
                isActive={location.pathname === "/projects"}
              >
                Projects
              </HeaderMenuItem>
              <HeaderMenuItem
                as={Link}
                to="/people"
                isActive={location.pathname === "/people"}
              >
                People
              </HeaderMenuItem>
            </HeaderNavigation>

            <HeaderGlobalBar>
              <HeaderGlobalAction
                aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                onClick={toggleTheme}
                tooltipAlignment="end"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </HeaderGlobalAction>
            </HeaderGlobalBar>
          </Header>

          {/* Mobile SideNav (hidden on desktop via CSS) */}
          <SideNav
            aria-label="Side navigation"
            expanded={isSideNavExpanded}
            onOverlayClick={onClickSideNavExpand}
            className="responsive-sidenav"
          >
            <SideNavItems>
              <SideNavMenuItem as={Link} to="/" onClick={onClickSideNavExpand}>
                Home
              </SideNavMenuItem>
              <SideNavMenuItem as={Link} to="/projects" onClick={onClickSideNavExpand}>
                Projects
              </SideNavMenuItem>
              <SideNavMenuItem as={Link} to="/people" onClick={onClickSideNavExpand}>
                People
              </SideNavMenuItem>
            </SideNavItems>
          </SideNav>
        </>
      )}
    />
  );
}