import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/outfits", label: "Outfits" },
  { to: "/planner", label: "Planner" },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="top-nav__brand">
          <span className="top-nav__eyebrow">Wardrobe OS</span>
          <strong>Attire</strong>
        </div>
        <nav className="top-nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? "top-nav__link top-nav__link--active" : "top-nav__link"
              }
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

