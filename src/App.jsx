import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CreditCard, Users, FileText } from 'lucide-react';
import MonitorTab from './components/MonitorTab';
import CrisisTab from './components/CrisisTab';
import CardTab from './components/CardTab';
import CareTab from './components/CareTab';
import LogTab from './components/LogTab';

function App() {
  const [activeTab, setActiveTab] = useState('monitor');
  const [vitals, setVitals] = useState({
    spo2: 97,
    heartRate: 78,
    temperature: 98.6,
    hrv: 65,
  });
  
  const [vitalsHistory, setVitalsHistory] = useState({
    spo2: Array(20).fill(97),
    heartRate: Array(20).fill(78),
    temperature: Array(20).fill(98.6),
    hrv: Array(20).fill(65),
  });
  
  const [inCrisis, setInCrisis] = useState(false);
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [painLogs, setPainLogs] = useState([]);
  
  // Patient data
  const patientData = {
    name: 'Maya Johnson',
    age: 24,
    genotype: 'HbSS',
    baselineSpo2: 97,
    hematologist: {
      name: 'Dr. Amara Ayers',
      title: 'MD, Hematology',
      facility: 'Johns Hopkins Sickle Cell Center',
      phone: '(410) 555-0142',
    },
    insurance: {
      provider: 'Aetna PPO',
      memberId: 'W123456789',
      deductible: 2500,
      deductibleUsed: 1240,
    },
    riskFactors: {
      acuteChestSyndrome: 2,
    },
  };

  const tabs = [
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'crisis', label: 'Crisis', icon: AlertCircle },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'care', label: 'Care', icon: Users },
    { id: 'log', label: 'Log', icon: FileText },
  ];

  const addPainLog = (pain, location) => {
    const newLog = {
      timestamp: new Date(),
      pain,
      location,
      vitals: { ...vitals },
    };
    setPainLogs([newLog, ...painLogs]);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'monitor':
        return (
          <MonitorTab
            vitals={vitals}
            setVitals={setVitals}
            vitalsHistory={vitalsHistory}
            setVitalsHistory={setVitalsHistory}
            inCrisis={inCrisis}
            setInCrisis={setInCrisis}
            crisisDetected={crisisDetected}
            setCrisisDetected={setCrisisDetected}
            setActiveTab={setActiveTab}
          />
        );
      case 'crisis':
        return (
          <CrisisTab
            patientData={patientData}
            addPainLog={addPainLog}
          />
        );
      case 'card':
        return (
          <CardTab
            patientData={patientData}
            vitals={vitals}
          />
        );
      case 'care':
        return (
          <CareTab
            patientData={patientData}
          />
        );
      case 'log':
        return (
          <LogTab
            painLogs={painLogs}
            patientData={patientData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="content-area">
        {renderTab()}
      </div>
      
      <nav className="tab-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={24} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
