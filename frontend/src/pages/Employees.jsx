import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const ROLE_COLORS = {
  RM: { bg: "#EFF6FF", color: "#2563EB" },
  APE: { bg: "#F0FDF4", color: "#059669" },
  CFO: { bg: "#FEF3C7", color: "#D97706" },
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/rest/employees");
        setEmployees(res.data.data.users || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) =>
    name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header page-header-row">
          <div>
            <div className="page-title">Employees</div>
            <div className="page-subtitle">{employees.length} registered users</div>
          </div>
          <input
            className="input-field"
            style={{ width: 240 }}
            placeholder="Search by name, email, role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              Loading employees…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">
                {search ? "No employees match your search" : "No employees found"}
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => {
                  const roleStyle = ROLE_COLORS[emp.role] || { bg: "var(--bg)", color: "var(--text-secondary)" };
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--accent)", color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, flexShrink: 0
                          }}>
                            {initials(emp.name)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{emp.email}</td>
                      <td>
                        <span style={{
                          display: "inline-block", padding: "2px 10px",
                          borderRadius: 99, fontSize: 11, fontWeight: 700,
                          background: roleStyle.bg, color: roleStyle.color,
                        }}>
                          {emp.role}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
