import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

const statusMap = {
  PENDING: { label: "Pending", cls: "badge-pending" },
  RM_APPROVED: { label: "RM Approved", cls: "badge-rm_approved" },
  APPROVED: { label: "Approved", cls: "badge-approved" },
  REJECTED: { label: "Rejected", cls: "badge-rejected" },
};

function Badge({ status }) {
  const s = statusMap[status] || { label: status, cls: "badge-pending" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/rest/reimbursements", {
        ...form,
        amount: parseFloat(form.amount),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create reimbursement");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">New Reimbursement</div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}
          <div className="form-row">
            <div className="input-group">
              <label className="input-label">Title</label>
              <input
                className="input-field"
                placeholder="e.g. Client dinner, Office supplies"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input
                className="input-field"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Provide details about this expense…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ApproveModal({ reimbursement, userRole, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);

  const canApprove = (userRole === "RM" && reimbursement.status === "PENDING") ||
    (userRole === "CFO" && reimbursement.status === "RM_APPROVED");

  const handleAction = async (status) => {
    setLoading(true);
    try {
      await api.patch("/rest/reimbursements", {
        reimbursementId: reimbursement.id,
        status,
      });
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Review Reimbursement</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Title</span>
            <span style={{ fontWeight: 600 }}>{reimbursement.title}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Amount</span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>₹{parseFloat(reimbursement.amount).toLocaleString("en-IN")}</span>
          </div>
          <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 13 }}>{reimbursement.description}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Current Status</span>
            <Badge status={reimbursement.status} />
          </div>
        </div>
        {canApprove ? (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleAction("REJECTED")} disabled={loading}>
              Reject
            </button>
            <button className="btn btn-success btn-sm" onClick={() => handleAction("APPROVED")} disabled={loading}>
              Approve
            </button>
          </div>
        ) : (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reimbursements() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchData = async () => {
    try {
      const res = await api.get("/rest/reimbursements");
      setItems(res.data.data.reimbursements || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterStatus === "ALL" ? items : items.filter(r => r.status === filterStatus);

  const canCreate = !["CFO"].includes(user?.role);

  const canReview = (item) => {
    if (user?.role === "RM" && item.status === "PENDING") return true;
    if (user?.role === "CFO" && item.status === "RM_APPROVED") return true;
    return false;
  };

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header page-header-row">
          <div>
            <div className="page-title">Reimbursements</div>
            <div className="page-subtitle">{items.length} total requests</div>
          </div>
          {canCreate && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + New Request
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {["ALL", "PENDING", "RM_APPROVED", "APPROVED", "REJECTED"].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${filterStatus === s ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === "ALL" ? "All" : statusMap[s]?.label || s}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
              Loading reimbursements…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <div className="empty-title">
                {filterStatus !== "ALL" ? `No ${statusMap[filterStatus]?.label} requests` : "No reimbursements yet"}
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.title}</td>
                    <td style={{ color: "var(--text-secondary)", maxWidth: 200 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.description}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{parseFloat(r.amount).toLocaleString("en-IN")}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${canReview(r) ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setSelected(r)}
                      >
                        {canReview(r) ? "Review" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchData}
        />
      )}

      {selected && (
        <ApproveModal
          reimbursement={selected}
          userRole={user?.role}
          onClose={() => setSelected(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
