import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [reimbursements, setReimbursements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, eRes] = await Promise.all([
          api.get("/rest/reimbursements"),
          api.get("/rest/employees"),
        ]);
        setReimbursements(rRes.data.data.reimbursements || []);
        setEmployees(eRes.data.data.users || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const counts = {
    pending: reimbursements.filter(r => r.status === "PENDING").length,
    rmApproved: reimbursements.filter(r => r.status === "RM_APPROVED").length,
    approved: reimbursements.filter(r => r.status === "APPROVED").length,
    rejected: reimbursements.filter(r => r.status === "REJECTED").length,
  };

  const totalAmount = reimbursements
    .filter(r => r.status === "APPROVED")
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const recent = reimbursements.slice(0, 5);

  const statusBadge = (status) => {
    const map = {
      PENDING: "pending",
      RM_APPROVED: "rm_approved",
      APPROVED: "approved",
      REJECTED: "rejected",
    };
    const labels = {
      PENDING: "Pending",
      RM_APPROVED: "RM Approved",
      APPROVED: "Approved",
      REJECTED: "Rejected",
    };
    return (
      <span className={`badge badge-${map[status] || "pending"}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            Hello, {user?.name} — here's what's happening today
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading…</div>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-label">Total Employees</div>
                <div className="stat-value">{employees.length}</div>
                <div className="stat-sub">registered in system</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending Approvals</div>
                <div className="stat-value" style={{ color: "var(--pending)" }}>
                  {counts.pending + counts.rmApproved}
                </div>
                <div className="stat-sub">awaiting action</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Approved Amount</div>
                <div className="stat-value" style={{ color: "var(--success)" }}>
                  ₹{totalAmount.toLocaleString("en-IN")}
                </div>
                <div className="stat-sub">{counts.approved} claims approved</div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Reimbursements</span>
                <a href="/reimbursements" style={{ fontSize: 13, color: "var(--accent)" }}>View all →</a>
              </div>
              {recent.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No reimbursements yet</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.title}</td>
                        <td>₹{parseFloat(r.amount).toLocaleString("en-IN")}</td>
                        <td>{statusBadge(r.status)}</td>
                        <td style={{ color: "var(--text-secondary)" }}>
                          {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
