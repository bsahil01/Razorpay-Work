import { Link, useLocation, useNavigate } from "react-router-dom";

const IconDashboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { path: "/employees", label: "Employees", icon: <IconUsers /> },
    { path: "/reimbursements", label: "Reimbursements", icon: <IconReceipt /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="sidebar-logo-text">PayTrack</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name || "User"}</div>
            <div className="user-role">{user?.role || "—"}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <IconLogout /> Sign out
        </button>
      </div>
    </aside>
  );
}
