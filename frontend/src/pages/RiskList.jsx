import { useEffect, useState } from "react";
import api from "../services/api";

function RiskList() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      const response = await api.get("/all");
      setRisks(response.data.content || response.data);
    } catch (error) {
      console.error("Error fetching risks:", error);

      // temporary demo data until backend is ready
      setRisks([
        {
          id: 1,
          title: "Server Downtime Risk",
          category: "Technical",
          status: "OPEN",
          riskScore: 8,
          owner: "Shriya",
        },
        {
          id: 2,
          title: "Data Loss Risk",
          category: "Security",
          status: "IN_PROGRESS",
          riskScore: 9,
          owner: "Team",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white p-6 rounded shadow animate-pulse">
          Loading risk records...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Risk Heatmap List</h1>

      {risks.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          No risk records found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full border">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Title</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Risk Score</th>
                <th className="p-3 border">Owner</th>
              </tr>
            </thead>

            <tbody>
              {risks.map((risk) => (
                <tr key={risk.id} className="text-center hover:bg-gray-100">
                  <td className="p-3 border">{risk.id}</td>
                  <td className="p-3 border">{risk.title}</td>
                  <td className="p-3 border">{risk.category}</td>
                  <td className="p-3 border">{risk.status}</td>
                  <td className="p-3 border">{risk.riskScore}</td>
                  <td className="p-3 border">{risk.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RiskList;