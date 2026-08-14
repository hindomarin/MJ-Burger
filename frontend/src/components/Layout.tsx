import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

// The black and gold bar on top of every page, with the menu.
// <Outlet /> is where React Router puts the current page.

export function Layout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.svg" alt="" className="brand-logo" />
          <div>
            <span className="brand-name">MJ Juicy Burger</span>
            <span className="brand-tagline">Juicy • Fresh • Premium</span>
          </div>
        </div>

        <nav className="main-nav">
          <NavLink to="/pos">POS</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/history">History</NavLink>
          {/* Only the owner sees these. */}
          {isAdmin && <NavLink to="/menu">Menu</NavLink>}
          {isAdmin && <NavLink to="/sales">Sales</NavLink>}
          {isAdmin && <NavLink to="/inventory">Stock</NavLink>}
        </nav>

        <div className="user-box">
          <span className="user-name">{user?.username}</span>
          <span className="user-role">{user?.role}</span>
          <button className="btn btn-small" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
