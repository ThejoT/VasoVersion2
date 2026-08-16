import { Download, TrendingDown, Clock, MapPin } from 'lucide-react';

const LogTab = ({ painLogs, patientData }) => {
  // Mock historical crisis data
  const crisisHistory = [
    {
      date: 'Feb 28, 2026',
      duration: '36 hours',
      peakPain: 9,
      location: 'Johns Hopkins Infusion Center',
      waitTime: '18 min',
      outcome: 'Resolved with IV hydration + analgesia',
      highlight: false,
    },
    {
      date: 'Jan 12, 2026',
      duration: '48 hours',
      peakPain: 8,
      location: 'Johns Hopkins ED',
      waitTime: '4h 20m',
      outcome: 'Admitted 2 days, acute chest syndrome ruled out',
      highlight: true,
    },
    {
      date: 'Nov 3, 2025',
      duration: '24 hours',
      peakPain: 7,
      location: 'Johns Hopkins Infusion Center',
      waitTime: '25 min',
      outcome: 'Resolved with IV hydration + analgesia',
      highlight: false,
    },
    {
      date: 'Aug 19, 2025',
      duration: '52 hours',
      peakPain: 10,
      location: 'Johns Hopkins ED',
      waitTime: '2h 45m',
      outcome: 'Admitted 3 days, developed acute chest syndrome',
      highlight: false,
    },
  ];

  const stats = {
    crisesThisYear: 2,
    avgEdWait: '3h 32m',
    avgInfusionWait: '21 min',
  };

  const handleExport = () => {
    alert(`Exporting crisis report for ${patientData.hematologist.name}...`);
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h1 className="section-title">Crisis Log</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.crisesThisYear}</div>
          <div className="stat-label">Crises This Year</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgEdWait}</div>
          <div className="stat-label">Avg ED Wait</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgInfusionWait}</div>
          <div className="stat-label">Avg Infusion Wait</div>
        </div>
      </div>

      <button className="button button-primary" onClick={handleExport}>
        <Download size={20} />
        Export Report for {patientData.hematologist.name.split(' ')[1]}
      </button>

      {painLogs.length > 0 && (
        <>
          <h2 className="section-subtitle">Recent Pain Logs</h2>
          {painLogs.slice(0, 5).map((log, index) => (
            <div key={index} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#f9fafb' }}>
                  {formatDateTime(log.timestamp)}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: log.pain >= 7 ? '#dc2626' : '#f9fafb',
                  }}
                >
                  Pain: {log.pain}/10
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                Location: {log.location.join(', ')}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                SpO2: {log.vitals.spo2.toFixed(1)}% · HR: {Math.round(log.vitals.heartRate)} bpm · Temp:{' '}
                {log.vitals.temperature.toFixed(1)}°F
              </div>
            </div>
          ))}
        </>
      )}

      <h2 className="section-subtitle">Crisis History</h2>

      {crisisHistory.map((crisis, index) => (
        <div key={index} className={`log-entry ${crisis.highlight ? 'highlight' : ''}`}>
          <div className="log-header">
            <div className="log-date">{crisis.date}</div>
            <div className="log-duration">{crisis.duration}</div>
          </div>
          <div className="log-details">
            <div className="log-detail">
              <strong>Peak Pain:</strong> {crisis.peakPain}/10
            </div>
            <div className="log-detail">
              <strong>Location:</strong> {crisis.location}
            </div>
            <div className="log-detail">
              <strong>Wait Time:</strong>{' '}
              <span className={crisis.highlight ? 'log-wait-time' : ''}>{crisis.waitTime}</span>
            </div>
            <div className="log-detail" style={{ gridColumn: '1 / -1' }}>
              <strong>Outcome:</strong> {crisis.outcome}
            </div>
          </div>
          {crisis.highlight && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#fca5a5',
              }}
            >
              ⚠️ ED visit — 4h 20m before first analgesia
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LogTab;
