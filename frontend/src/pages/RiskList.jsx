import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRisks } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import ScoreBadge from '../components/ScoreBadge';

const demoRisks = [
  {
    id: 1,
    title: 'Data Breach Risk',
    category: 'Security',
    score: 9,
    status: 'Open',
    owner: 'Shriya',
    dueDate: '2026-05-10',
  },
  {
    id: 2,
    title: 'Server Downtime Risk',
    category: 'Technical',
    score: 8,
    status: 'In Progress',
    owner: 'Backend Team',
    dueDate: '2026-05-12',
  },
  {
    id: 3,
    title: 'Project Delay Risk',
    category: 'Operational',
    score: 5,
    status: 'Resolved',
    owner: 'Manager',
    dueDate: '2026-05-15',
  },
];

export default function RiskList() {
  const { user } = useAuth();
  const [risks, setRisks] = useState(demoRisks);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    setLoading(true);

    try {
      const params = { page, size: 10, sortBy: 'createdAt', sortDir: 'desc' };
      const response = await getRisks(params);

      if (response?.data?.content?.length > 0) {
        setRisks(response.data.content);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setRisks(demoRisks);
        setTotalPages(1);
      }
    } catch (error) {
      console.log('Backend not running. Using demo risks.');
      setRisks(demoRisks);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === '' || risk.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const deleteRisk = (id) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      setRisks(risks.filter((risk) => risk.id !== id));
      alert('Risk deleted successfully');
    }
  };

  const exportCSV = () => {
    const csv =
      'ID,Title,Category,Score,Status,Owner,Due Date\n' +
      filteredRisks
        .map(
          (risk) =>
            `${risk.id},${risk.title},${risk.category},${risk.score},${risk.status},${risk.owner},${risk.dueDate}`
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'risks.csv';
    a.click();

    window.URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ color: '#1B4F8A', fontSize: '36px', fontWeight: 'bold' }}>
          Risk List
        </h1>

        {user?.role !== 'VIEWER' && (
          <Link
            to="/risks/new"
            style={{
              padding: '10px 16px',
              background: '#1B4F8A',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            New Risk
          </Link>
        )}
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '14px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
          marginBottom: '24px',
        }}
      >
        <input
          placeholder="Search risk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            marginBottom: '12px',
          }}
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button
          onClick={exportCSV}
          style={{
            padding: '10px 16px',
            background: '#1B4F8A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Export CSV
        </button>
      </div>

      {filteredRisks.length === 0 ? (
        <EmptyState message="No risks found" />
      ) : (
        <>
          <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1B4F8A', color: 'white' }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Score</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Owner</th>
                  <th style={thStyle}>Due Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRisks.map((risk) => (
                  <tr key={risk.id}>
                    <td style={tdStyle}>{risk.id}</td>
                    <td style={tdStyle}>{risk.title}</td>
                    <td style={tdStyle}>{risk.category}</td>
                    <td style={tdStyle}>
                      <ScoreBadge score={risk.score} />
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={risk.status} />
                    </td>
                    <td style={tdStyle}>{risk.owner || '-'}</td>
                    <td style={tdStyle}>
                      {risk.dueDate
                        ? new Date(risk.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td style={tdStyle}>
                      <Link to={`/risks/${risk.id}`} style={actionBtn}>
                        View
                      </Link>

                      <Link to={`/risks/${risk.id}/edit`} style={actionBtn}>
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteRisk(risk.id)}
                        style={{
                          ...actionBtn,
                          background: '#dc2626',
                          border: 'none',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

const thStyle = {
  padding: '14px',
  textAlign: 'center',
};

const tdStyle = {
  padding: '14px',
  textAlign: 'center',
  borderBottom: '1px solid #e5e7eb',
};

const actionBtn = {
  display: 'inline-block',
  padding: '8px 12px',
  margin: '4px',
  background: '#1B4F8A',
  color: 'white',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
};