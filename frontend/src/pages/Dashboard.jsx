import { useEffect, useState } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";

const demoStats = {
  total: 3,
  highScoreCount: 2,
  overdueCount: 1,
  resolvedThisMonth: 1,
  byCategory: {
    Security: 1,
    Technical: 1,
    Operational: 1,
  },
  byStatus: {
    Open: 1,
    "In Progress": 1,
    Resolved: 1,
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(demoStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Backend call can be added here when backend is running.
      // For demo mode, fallback data is used.
      setStats(demoStats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats(demoStats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.subtitle}>Overview of risk performance and status</p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardLabel}>Total Risks</h3>
          <p style={styles.cardValue}>{stats.total}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardLabel}>High Score (7+)</h3>
          <p style={{ ...styles.cardValue, color: "#f97316" }}>
            {stats.highScoreCount}
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardLabel}>Overdue</h3>
          <p style={{ ...styles.cardValue, color: "#dc2626" }}>
            {stats.overdueCount}
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardLabel}>Resolved</h3>
          <p style={{ ...styles.cardValue, color: "#16a34a" }}>
            {stats.resolvedThisMonth}
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Risks by Category</h3>

          {Object.entries(stats.byCategory).map(([category, count]) => (
            <div key={category} style={styles.row}>
              <span>{category}</span>
              <div style={styles.progressOuter}>
                <div
                  style={{
                    ...styles.progressInner,
                    width: `${(count / stats.total) * 100}%`,
                  }}
                />
              </div>
              <b>{count}</b>
            </div>
          ))}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Risks by Status</h3>

          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} style={styles.statusRow}>
              <span style={styles.statusDot}></span>
              <span>{status}</span>
              <b>{count}</b>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.panel}>
        <h3 style={styles.panelTitle}>Risk Heatmap</h3>
        <p style={styles.subtitle}>
          Visual severity mapping for Low, Medium and High risk levels
        </p>

        <div style={styles.heatmap}>
          <div style={{ ...styles.heatBox, background: "#16a34a" }}>Low</div>
          <div style={{ ...styles.heatBox, background: "#f59e0b" }}>Medium</div>
          <div style={{ ...styles.heatBox, background: "#dc2626" }}>High</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "1100px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    color: "#1B4F8A",
    fontSize: "40px",
    marginBottom: "6px",
  },
  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "24px",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },
  cardLabel: {
    color: "#64748b",
    fontSize: "15px",
    margin: 0,
  },
  cardValue: {
    color: "#1B4F8A",
    fontSize: "38px",
    fontWeight: "bold",
    margin: "10px 0 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  panel: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "14px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    marginBottom: "22px",
  },
  panelTitle: {
    color: "#1B4F8A",
    marginTop: 0,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 30px",
    alignItems: "center",
    gap: "12px",
    margin: "14px 0",
  },
  progressOuter: {
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    background: "#1B4F8A",
  },
  statusRow: {
    display: "grid",
    gridTemplateColumns: "20px 1fr 40px",
    alignItems: "center",
    gap: "8px",
    margin: "14px 0",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#1B4F8A",
  },
  heatmap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
  },
  heatBox: {
    color: "white",
    padding: "28px",
    borderRadius: "14px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "22px",
  },
};