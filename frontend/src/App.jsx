import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const demoRisks = [
  {
    id: 1,
    title: "Data Breach Risk",
    category: "Security",
    status: "Open",
    score: 9,
    owner: "Shriya",
    description: "Risk of unauthorized access to sensitive customer data.",
    mitigation: "Enable MFA, monitor logs, and restrict access.",
  },
  {
    id: 2,
    title: "Server Downtime Risk",
    category: "Technical",
    status: "In Progress",
    score: 8,
    owner: "Backend Team",
    description: "Application may become unavailable during high traffic.",
    mitigation: "Use monitoring, caching, and backup servers.",
  },
  {
    id: 3,
    title: "Project Delay Risk",
    category: "Operational",
    status: "Resolved",
    score: 5,
    owner: "Manager",
    description: "Delay due to dependency on multiple teams.",
    mitigation: "Daily tracking and clear task ownership.",
  },
];

export default function App() {
  const [page, setPage] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [risks, setRisks] = useState(demoRisks);
  const [selectedRisk, setSelectedRisk] = useState(demoRisks[0]);
  const [isEditing, setIsEditing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [sortKey, setSortKey] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState("6 months");

  const rowsPerPage = 2;

  const [formData, setFormData] = useState({
    title: "Cloud Data Leakage Risk",
    category: "Security",
    description: "Risk of confidential files being accessed by unauthorized users.",
    impact: "High",
    status: "Open",
    owner: "Shriya",
    mitigation: "Apply access control, enable MFA and monitor logs.",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const status = params.get("status") || "";

    setSearchQuery(q);
    setDebouncedSearch(q);
    setStatusFilter(status);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("q", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);

    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");

    window.history.replaceState({}, "", newUrl);
  }, [debouncedSearch, statusFilter]);

  const login = (e) => {
    e.preventDefault();
    setLoggedIn(true);
    setPage("dashboard");
  };

  const logout = () => {
    setLoggedIn(false);
    setPage("login");
  };

  const highRisks = risks.filter((r) => r.score >= 7).length;
  const openRisks = risks.filter((r) => r.status === "Open").length;
  const resolvedRisks = risks.filter((r) => r.status === "Resolved").length;

  const filteredRisks = risks
    .filter((risk) => {
      const search = debouncedSearch.toLowerCase();

      const matchesSearch =
        risk.title.toLowerCase().includes(search) ||
        risk.category.toLowerCase().includes(search) ||
        risk.owner.toLowerCase().includes(search) ||
        risk.status.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "" || risk.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      }

      return valueA < valueB ? 1 : -1;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRisks.length / rowsPerPage));

  const paginatedRisks = filteredRisks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    setSortKey(key);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const csv =
      "Title,Category,Status,Score,Owner\n" +
      filteredRisks
        .map((r) => `${r.title},${r.category},${r.status},${r.score},${r.owner}`)
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risks.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteRisk = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this risk?");
    if (confirmed) {
      setRisks(risks.filter((risk) => risk.id !== id));
      alert("Risk deleted successfully");
    }
  };

  const openEditForm = (risk) => {
    setSelectedRisk(risk);
    setIsEditing(true);
    setFormData({
      title: risk.title,
      category: risk.category,
      description: risk.description,
      impact: risk.score >= 8 ? "High" : risk.score >= 5 ? "Medium" : "Low",
      status: risk.status,
      owner: risk.owner,
      mitigation: risk.mitigation,
    });
    setPage("form");
  };

  const resetFormForNewRisk = () => {
    setIsEditing(false);
    setFormData({
      title: "Cloud Data Leakage Risk",
      category: "Security",
      description: "Risk of confidential files being accessed by unauthorized users.",
      impact: "High",
      status: "Open",
      owner: "Shriya",
      mitigation: "Apply access control, enable MFA and monitor logs.",
    });
    setPage("form");
  };

  const handleSubmitRisk = () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      alert("Description is required");
      return;
    }

    const score =
      formData.impact === "High" ? 9 : formData.impact === "Medium" ? 6 : 3;

    if (isEditing) {
      setRisks(
        risks.map((risk) =>
          risk.id === selectedRisk.id
            ? {
                ...risk,
                title: formData.title,
                category: formData.category,
                description: formData.description,
                status: formData.status,
                owner: formData.owner,
                mitigation: formData.mitigation,
                score,
              }
            : risk
        )
      );
      alert("Risk updated successfully");
    } else {
      const newRisk = {
        id: risks.length + 1,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        owner: formData.owner,
        mitigation: formData.mitigation,
        score,
      };

      setRisks([...risks, newRisk]);
      alert("Risk added successfully");
    }

    setIsEditing(false);
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
    setPage("risks");
  };

  const askAI = () => {
    alert(
      "AI Recommendation: This risk should be prioritized. Suggested actions include monitoring, access control, owner assignment and periodic review."
    );
  };

  const categoryChartData = [
    { name: "Security", value: risks.filter((r) => r.category === "Security").length },
    { name: "Technical", value: risks.filter((r) => r.category === "Technical").length },
    { name: "Operational", value: risks.filter((r) => r.category === "Operational").length },
  ];

  const statusChartData = [
    { name: "Open", value: openRisks },
    { name: "In Progress", value: risks.filter((r) => r.status === "In Progress").length },
    { name: "Resolved", value: resolvedRisks },
  ];

  const trendData = [
    { month: "Jan", risks: 2 },
    { month: "Feb", risks: 3 },
    { month: "Mar", risks: 4 },
    { month: "Apr", risks: 5 },
    { month: "May", risks: risks.length },
    { month: "Jun", risks: risks.length + 2 },
  ];

  if (!loggedIn && page === "login") {
    return (
      <>
        <Style />
        <div className="login-page">
          <form className="login-card" onSubmit={login}>
            <h1>Risk Heatmap</h1>
            <p>AI-Powered Risk Management</p>

            <label>Email</label>
            <input defaultValue="admin@tool05.com" />

            <label>Password</label>
            <input type="password" defaultValue="admin123" />

            <button type="submit">Sign In</button>

            <div className="demo-box">
              <b>Demo Credentials</b>
              <p>admin@tool05.com / admin123</p>
              <p>manager@tool05.com / manager123</p>
              <p>viewer@tool05.com / viewer123</p>
            </div>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      <Style />

      <nav className="navbar">
        <h2>Risk Heatmap Visualiser</h2>
        <div>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
          <button onClick={() => setPage("risks")}>Risks</button>
          <button onClick={resetFormForNewRisk}>Add Risk</button>
          <button onClick={() => setPage("analytics")}>Analytics</button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <main className="container">
        {page === "dashboard" && (
          <>
            <h1>Dashboard</h1>
            <p className="subtitle">Overview of risk performance and status</p>

            <div className="cards">
              <div className="card">
                <h3>Total Risks</h3>
                <p>{risks.length}</p>
              </div>
              <div className="card danger">
                <h3>High Score (7+)</h3>
                <p>{highRisks}</p>
              </div>
              <div className="card warning">
                <h3>Open Risks</h3>
                <p>{openRisks}</p>
              </div>
              <div className="card success">
                <h3>Resolved</h3>
                <p>{resolvedRisks}</p>
              </div>
            </div>

            <section className="panel">
              <h2>Risks by Category</h2>
              <div className="bar">
                <span style={{ width: "75%" }}>Security</span>
              </div>
              <div className="bar">
                <span style={{ width: "65%" }}>Technical</span>
              </div>
              <div className="bar">
                <span style={{ width: "45%" }}>Operational</span>
              </div>
            </section>

            <section className="panel">
              <h2>Risk Heatmap</h2>
              <p className="subtitle">Visual representation of risk severity levels</p>
              <div className="heatmap">
                <div className="heat low">Low Risk</div>
                <div className="heat medium">Medium Risk</div>
                <div className="heat high">High Risk</div>
              </div>
            </section>
          </>
        )}

        {page === "risks" && (
          <>
            <h1>Risk List</h1>
            <p className="subtitle">Search, filter, sort and view risks</p>

            <div className="panel">
              <input
                placeholder="Search by title, category, owner or status..."
                value={searchQuery}
                onChange={handleSearchChange}
              />

              <select value={statusFilter} onChange={handleStatusChange}>
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button onClick={exportCSV}>Export CSV</button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort("title")}>Title</th>
                    <th onClick={() => handleSort("category")}>Category</th>
                    <th onClick={() => handleSort("status")}>Status</th>
                    <th onClick={() => handleSort("score")}>Score</th>
                    <th onClick={() => handleSort("owner")}>Owner</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRisks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        🔍 No risks found. Try different search or filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRisks.map((risk) => (
                      <tr key={risk.id}>
                        <td>{risk.title}</td>
                        <td>{risk.category}</td>
                        <td>
                          <span className="badge">{risk.status}</span>
                        </td>
                        <td>
                          <b>{risk.score}</b>
                        </td>
                        <td>{risk.owner}</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedRisk(risk);
                              setPage("detail");
                            }}
                          >
                            View
                          </button>
                          <button onClick={() => openEditForm(risk)}>Edit</button>
                          <button onClick={() => deleteRisk(risk.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {page === "form" && (
          <>
            <h1>{isEditing ? "Edit Risk" : "Create Risk"}</h1>
            <form className="panel form">
              <label>Title</label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />

              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option>Security</option>
                <option>Technical</option>
                <option>Operational</option>
              </select>

              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <label>Impact</label>
              <select
                value={formData.impact}
                onChange={(e) =>
                  setFormData({ ...formData, impact: e.target.value })
                }
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <label>Owner</label>
              <input
                value={formData.owner}
                onChange={(e) =>
                  setFormData({ ...formData, owner: e.target.value })
                }
              />

              <label>Mitigation Plan</label>
              <textarea
                value={formData.mitigation}
                onChange={(e) =>
                  setFormData({ ...formData, mitigation: e.target.value })
                }
              />

              <button type="button" onClick={handleSubmitRisk}>
                {isEditing ? "Update Risk" : "Submit Risk"}
              </button>
            </form>
          </>
        )}

        {page === "detail" && (
          <>
            <h1>Risk Detail</h1>
            <section className="panel">
              <h2>{selectedRisk.title}</h2>
              <p>
                <b>Category:</b> {selectedRisk.category}
              </p>
              <p>
                <b>Status:</b> <span className="badge">{selectedRisk.status}</span>
              </p>
              <p>
                <b>Risk Score:</b> {selectedRisk.score}
              </p>
              <p>
                <b>Description:</b> {selectedRisk.description}
              </p>
              <p>
                <b>Mitigation:</b> {selectedRisk.mitigation}
              </p>

              <div className="ai-box">
                <h3>AI Analysis</h3>
                <p>
                  This risk needs priority attention. Recommended actions include
                  access control, monitoring, and periodic security review.
                </p>
                <button onClick={askAI}>Ask AI Again</button>
              </div>
            </section>
          </>
        )}

        {page === "analytics" && (
          <>
            <h1>Analytics</h1>
            <p className="subtitle">Risk insights using Recharts visualisation</p>

            <div className="panel">
              <label>Period Selector</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option>3 months</option>
                <option>6 months</option>
                <option>1 year</option>
              </select>
              <p className="subtitle">Selected period: {period}</p>
            </div>

            <div className="grid">
              <div className="panel">
                <h2>BarChart by Category</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryChartData}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1B4F8A" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="panel">
                <h2>LineChart Over Time</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="risks" stroke="#1B4F8A" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="panel">
                <h2>PieChart by Status</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      label
                    >
                      <Cell fill="#1B4F8A" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#16a34a" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

function Style() {
  return (
    <style>{`
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        background: #f4f7fb;
        color: #1f2937;
      }

      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1B4F8A, #eef5ff);
      }

      .login-card {
        width: 380px;
        background: white;
        padding: 32px;
        border-radius: 16px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      }

      .login-card h1 {
        color: #1B4F8A;
        text-align: center;
        margin-bottom: 6px;
      }

      .login-card p {
        text-align: center;
        color: #64748b;
      }

      label {
        display: block;
        font-weight: 600;
        margin-top: 14px;
      }

      input, select, textarea {
        width: 100%;
        padding: 11px;
        margin-top: 6px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 15px;
        box-sizing: border-box;
      }

      textarea {
        min-height: 90px;
      }

      button {
        min-height: 44px;
        background: #1B4F8A;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        margin: 6px;
      }

      button:hover {
        background: #153d6b;
      }

      button:disabled {
        background: #94a3b8;
        cursor: not-allowed;
      }

      .demo-box {
        margin-top: 18px;
        padding: 14px;
        background: #f1f5f9;
        border-radius: 10px;
        font-size: 14px;
      }

      .navbar {
        background: #1B4F8A;
        color: white;
        padding: 16px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .navbar h2 {
        margin: 0;
      }

      .navbar button {
        background: white;
        color: #1B4F8A;
      }

      .container {
        max-width: 1100px;
        margin: 32px auto;
        padding: 0 20px;
      }

      h1 {
        color: #1B4F8A;
        text-align: center;
        font-size: 42px;
      }

      .subtitle {
        text-align: center;
        color: #64748b;
        margin-bottom: 24px;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }

      .card, .panel {
        background: white;
        padding: 22px;
        border-radius: 14px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        margin-bottom: 20px;
      }

      .card h3 {
        color: #64748b;
        margin: 0;
      }

      .card p {
        font-size: 36px;
        font-weight: bold;
        color: #1B4F8A;
        margin: 10px 0 0;
      }

      .danger p { color: #dc2626; }
      .warning p { color: #f59e0b; }
      .success p { color: #16a34a; }

      .table-wrapper {
        width: 100%;
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 760px;
        background: white;
        border-collapse: collapse;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 6px 18px rgba(0,0,0,0.08);
      }

      th {
        background: #1B4F8A;
        color: white;
        padding: 14px;
        cursor: pointer;
      }

      td {
        padding: 14px;
        border-bottom: 1px solid #e5e7eb;
        text-align: center;
      }

      .empty-row {
        padding: 30px;
        color: #64748b;
        font-weight: bold;
        text-align: center;
      }

      .badge {
        padding: 6px 10px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1B4F8A;
        font-weight: 700;
      }

      .ai-box {
        margin-top: 20px;
        padding: 18px;
        border-left: 5px solid #1B4F8A;
        background: #eff6ff;
        border-radius: 12px;
      }

      .grid, .heatmap {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }

      .heat {
        color: white;
        padding: 24px;
        border-radius: 14px;
        text-align: center;
        font-size: 22px;
        font-weight: bold;
      }

      .low { background: #16a34a; }
      .medium { background: #f59e0b; }
      .high { background: #dc2626; }

      .bar {
        background: #e5e7eb;
        border-radius: 999px;
        margin: 14px 0;
        overflow: hidden;
      }

      .bar span {
        display: block;
        background: #1B4F8A;
        color: white;
        padding: 10px;
        border-radius: 999px;
      }

      .form {
        max-width: 650px;
        margin: auto;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 14px;
        margin-top: 18px;
      }

      @media (max-width: 768px) {
        .navbar {
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }

        .navbar div {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .navbar button {
          width: 45%;
          margin: 4px;
        }

        .container {
          margin: 20px auto;
          padding: 0 12px;
        }

        h1 {
          font-size: 30px;
        }

        .login-card {
          width: 90%;
          padding: 24px;
        }

        .cards {
          grid-template-columns: 1fr;
        }

        .grid,
        .heatmap {
          grid-template-columns: 1fr;
        }

        input,
        select,
        textarea,
        button {
          font-size: 15px;
        }
      }
    `}</style>
  );
}