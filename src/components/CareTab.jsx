import { Phone, MessageSquare, MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const CareTab = ({ patientData }) => {
  const facilities = [
    {
      name: 'Johns Hopkins Sickle Cell Infusion Center',
      status: 'open',
      distance: '2.1 mi',
      copay: '$40',
      highlight: 'avg 22 min to pain relief',
    },
    {
      name: 'Baltimore Community Infusion',
      status: 'closed',
      distance: '5.4 mi',
      copay: '$40',
      highlight: null,
    },
    {
      name: 'Hopkins Emergency Department',
      status: '24h',
      distance: '2.3 mi',
      copay: '$350',
      highlight: 'avg 94 min to pain relief',
    },
  ];

  const careTeam = [
    {
      name: patientData.hematologist.name,
      role: 'Hematologist',
      phone: patientData.hematologist.phone,
    },
    {
      name: 'Jennifer Martinez, RN',
      role: 'Nurse Coordinator',
      phone: '(410) 555-0143',
    },
    {
      name: 'Denise Johnson',
      role: 'Emergency Contact',
      phone: '(443) 555-0198',
    },
  ];

  const handleCall = (name, phone) => {
    alert(`Calling ${name} at ${phone}...`);
  };

  const handleMessage = (name) => {
    alert(`Opening message to ${name}...`);
  };

  return (
    <div>
      <h1 className="section-title">Care Resources</h1>

      <div className="banner banner-success">
        Infusion centers get you pain relief 4× faster than the ER and are covered under your plan.
      </div>

      <h2 className="section-subtitle">Covered Near You ({patientData.insurance.provider})</h2>

      {facilities.map((facility, index) => (
        <div key={index} className="facility-card">
          <div className="facility-header">
            <div className="facility-name">{facility.name}</div>
            <div
              className={`facility-badge ${
                facility.status === 'open'
                  ? 'badge-open'
                  : facility.status === '24h'
                  ? 'badge-24h'
                  : 'badge-closed'
              }`}
            >
              {facility.status === 'open'
                ? 'OPEN'
                : facility.status === '24h'
                ? 'OPEN 24/7'
                : 'CLOSED'}
            </div>
          </div>
          <div className="facility-details">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              {facility.distance}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <DollarSign size={14} />
              {facility.copay} copay
            </span>
          </div>
          {facility.highlight && (
            <div className="facility-highlight">
              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {facility.highlight}
            </div>
          )}
        </div>
      ))}

      <h2 className="section-subtitle">Your Care Team</h2>

      {careTeam.map((member, index) => (
        <div key={index} className="team-member">
          <div className="team-member-info">
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
          <div className="team-member-actions">
            <button
              className="icon-button"
              onClick={() => handleCall(member.name, member.phone)}
              title="Call"
            >
              <Phone size={20} />
            </button>
            <button
              className="icon-button"
              onClick={() => handleMessage(member.name)}
              title="Message"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      ))}

      <h2 className="section-subtitle">Insurance</h2>

      <div className="card">
        <div className="insurance-info">
          <span className="insurance-label">Provider</span>
          <span className="insurance-value">{patientData.insurance.provider}</span>
        </div>
        <div className="insurance-info">
          <span className="insurance-label">Member ID</span>
          <span className="insurance-value">{patientData.insurance.memberId}</span>
        </div>
        
        <div style={{ marginTop: '20px', marginBottom: '8px' }}>
          <div className="insurance-info">
            <span className="insurance-label">Annual Deductible</span>
            <span className="insurance-value">
              ${patientData.insurance.deductibleUsed.toLocaleString()} of ${patientData.insurance.deductible.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(patientData.insurance.deductibleUsed / patientData.insurance.deductible) * 100}%`,
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#0f1b2e', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
              Prior Authorization Approved
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '24px' }}>
            VOC protocol — Approved through Dec 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareTab;
