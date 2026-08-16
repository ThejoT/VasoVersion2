import { useState } from 'react';
import { Phone, MessageSquare, AlertTriangle } from 'lucide-react';

const CrisisTab = ({ patientData, addPainLog }) => {
  const [selectedPain, setSelectedPain] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);

  const locations = ['Chest', 'Back', 'Arms', 'Legs', 'Abdomen'];

  const handlePainSelect = (pain) => {
    setSelectedPain(pain);
  };

  const toggleLocation = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleLogPain = () => {
    if (selectedPain && selectedLocations.length > 0) {
      addPainLog(selectedPain, selectedLocations);
      alert(`Pain logged: ${selectedPain}/10 in ${selectedLocations.join(', ')}`);
    } else {
      alert('Please select pain level and location(s)');
    }
  };

  const handleCall = (contact) => {
    alert(`Calling ${contact}...`);
  };

  const handleMessage = () => {
    alert('Opening message to care team...');
  };

  return (
    <div>
      <h1 className="section-title">Crisis Action</h1>

      <div className="banner banner-danger">
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>ACUTE CHEST SYNDROME RISK</strong> — {patientData.riskFactors.acuteChestSyndrome} prior episodes.
            Chest pain, fever, or breathlessness means go to the ED now.
          </div>
        </div>
      </div>

      <button
        className="button button-primary button-large"
        onClick={() => handleCall(patientData.hematologist.name)}
      >
        <Phone size={24} />
        Call {patientData.hematologist.name}
      </button>

      <button
        className="button button-primary button-large"
        onClick={() => handleCall('Infusion Center')}
      >
        <Phone size={24} />
        Call Infusion Center
      </button>

      <button
        className="button button-secondary button-large"
        onClick={handleMessage}
      >
        <MessageSquare size={24} />
        Message Care Team
      </button>

      <button
        className="button button-primary button-large"
        onClick={() => handleCall('911')}
        style={{ backgroundColor: '#7f1d1d', marginTop: '20px' }}
      >
        <Phone size={24} />
        Call 911
      </button>

      <div style={{ marginTop: '40px' }}>
        <h2 className="section-subtitle">Log Pain</h2>
        
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
            Pain Level (1-10)
          </span>
        </div>
        <div className="pain-scale">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              className={`pain-button ${selectedPain === num ? 'selected' : ''}`}
              onClick={() => handlePainSelect(num)}
            >
              {num}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '24px', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
            Location (select all that apply)
          </span>
        </div>
        <div className="location-toggle">
          {locations.map((location) => (
            <button
              key={location}
              className={`location-button ${selectedLocations.includes(location) ? 'selected' : ''}`}
              onClick={() => toggleLocation(location)}
            >
              {location}
            </button>
          ))}
        </div>

        <button
          className="button button-primary"
          onClick={handleLogPain}
          style={{ marginTop: '20px' }}
        >
          Save Pain Log Entry
        </button>
      </div>
    </div>
  );
};

export default CrisisTab;
