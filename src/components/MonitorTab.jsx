import { useState, useEffect, useRef } from 'react';
import { Wifi, AlertTriangle, Check, Bell } from 'lucide-react';

const MonitorTab = ({
  vitals,
  setVitals,
  vitalsHistory,
  setVitalsHistory,
  inCrisis,
  setInCrisis,
  crisisDetected,
  setCrisisDetected,
  setActiveTab,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [confirmations, setConfirmations] = useState([]);
  const intervalRef = useRef(null);
  const crisisIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Normal drift simulation
  useEffect(() => {
    if (!inCrisis && !crisisDetected) {
      intervalRef.current = setInterval(() => {
        setVitals((prev) => ({
          spo2: Math.max(95, Math.min(99, prev.spo2 + (Math.random() - 0.5) * 0.5)),
          heartRate: Math.max(70, Math.min(85, prev.heartRate + (Math.random() - 0.5) * 2)),
          temperature: Math.max(98.0, Math.min(99.0, prev.temperature + (Math.random() - 0.5) * 0.1)),
          hrv: Math.max(60, Math.min(75, prev.hrv + (Math.random() - 0.5) * 2)),
        }));

        setVitalsHistory((prev) => ({
          spo2: [...prev.spo2.slice(1), vitals.spo2],
          heartRate: [...prev.heartRate.slice(1), vitals.heartRate],
          temperature: [...prev.temperature.slice(1), vitals.temperature],
          hrv: [...prev.hrv.slice(1), vitals.hrv],
        }));
      }, 2000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [inCrisis, crisisDetected, vitals]);

  // Crisis simulation
  const simulateCrisis = () => {
    setInCrisis(true);
    let step = 0;
    const steps = 40; // 8 seconds at 200ms per step
    
    const initialVitals = { ...vitals };
    const targetVitals = {
      spo2: 89,
      heartRate: 128,
      temperature: 101.4,
      hrv: 35,
    };

    crisisIntervalRef.current = setInterval(() => {
      step++;
      const progress = step / steps;

      const newVitals = {
        spo2: initialVitals.spo2 - (initialVitals.spo2 - targetVitals.spo2) * progress,
        heartRate: initialVitals.heartRate + (targetVitals.heartRate - initialVitals.heartRate) * progress,
        temperature: initialVitals.temperature + (targetVitals.temperature - initialVitals.temperature) * progress,
        hrv: initialVitals.hrv - (initialVitals.hrv - targetVitals.hrv) * progress,
      };

      setVitals(newVitals);
      setVitalsHistory((prev) => ({
        spo2: [...prev.spo2.slice(1), newVitals.spo2],
        heartRate: [...prev.heartRate.slice(1), newVitals.heartRate],
        temperature: [...prev.temperature.slice(1), newVitals.temperature],
        hrv: [...prev.hrv.slice(1), newVitals.hrv],
      }));

      if (step >= steps) {
        clearInterval(crisisIntervalRef.current);
        setInCrisis(false);
        setCrisisDetected(true);
        setShowAlert(true);
        setCountdown(15);
        startCountdown();
      }
    }, 200);
  };

  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleGetHelp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDismiss = () => {
    setShowAlert(false);
    setCrisisDetected(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Reset vitals gradually
    setTimeout(() => {
      setVitals({
        spo2: 97,
        heartRate: 78,
        temperature: 98.6,
        hrv: 65,
      });
    }, 1000);
  };

  const handleGetHelp = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Show cascading confirmations
    const messages = [
      'Dr. Ayers notified',
      'Emergency contact Denise Johnson notified',
      'Care card unlocked',
    ];

    messages.forEach((msg, index) => {
      setTimeout(() => {
        setConfirmations((prev) => [...prev, msg]);
        
        if (index === messages.length - 1) {
          setTimeout(() => {
            setShowAlert(false);
            setActiveTab('crisis');
            setConfirmations([]);
          }, 1500);
        }
      }, index * 800);
    });
  };

  const isWarning = (vital, value) => {
    if (vital === 'spo2') return value < 92;
    if (vital === 'heartRate') return value > 110;
    if (vital === 'temperature') return value > 100.4;
    if (vital === 'hrv') return value < 45;
    return false;
  };

  const Sparkline = ({ data, warning }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={warning ? '#dc2626' : '#10b981'}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div>
      <h1 className="section-title">Monitor</h1>
      
      <div className="status-pill connected">
        <Wifi size={16} />
        <span>Device connected — Vaso Band</span>
      </div>

      <div className={`vital-card ${isWarning('spo2', vitals.spo2) ? 'warning' : ''}`}>
        <div className="vital-card-header">
          <span className="vital-label">Blood Oxygen</span>
        </div>
        <div>
          <span className={`vital-value ${isWarning('spo2', vitals.spo2) ? 'warning' : ''}`}>
            {vitals.spo2.toFixed(1)}
          </span>
          <span className="vital-unit">%</span>
        </div>
        <Sparkline data={vitalsHistory.spo2} warning={isWarning('spo2', vitals.spo2)} />
      </div>

      <div className={`vital-card ${isWarning('heartRate', vitals.heartRate) ? 'warning' : ''}`}>
        <div className="vital-card-header">
          <span className="vital-label">Heart Rate</span>
        </div>
        <div>
          <span className={`vital-value ${isWarning('heartRate', vitals.heartRate) ? 'warning' : ''}`}>
            {Math.round(vitals.heartRate)}
          </span>
          <span className="vital-unit">bpm</span>
        </div>
        <Sparkline data={vitalsHistory.heartRate} warning={isWarning('heartRate', vitals.heartRate)} />
      </div>

      <div className={`vital-card ${isWarning('temperature', vitals.temperature) ? 'warning' : ''}`}>
        <div className="vital-card-header">
          <span className="vital-label">Skin Temperature</span>
        </div>
        <div>
          <span className={`vital-value ${isWarning('temperature', vitals.temperature) ? 'warning' : ''}`}>
            {vitals.temperature.toFixed(1)}
          </span>
          <span className="vital-unit">°F</span>
        </div>
        <Sparkline data={vitalsHistory.temperature} warning={isWarning('temperature', vitals.temperature)} />
      </div>

      <div className={`vital-card ${isWarning('hrv', vitals.hrv) ? 'warning' : ''}`}>
        <div className="vital-card-header">
          <span className="vital-label">Heart Rate Variability</span>
        </div>
        <div>
          <span className={`vital-value ${isWarning('hrv', vitals.hrv) ? 'warning' : ''}`}>
            {Math.round(vitals.hrv)}
          </span>
          <span className="vital-unit">ms</span>
        </div>
        <Sparkline data={vitalsHistory.hrv} warning={isWarning('hrv', vitals.hrv)} />
      </div>

      <button
        className="button button-primary"
        onClick={simulateCrisis}
        disabled={inCrisis || crisisDetected}
        style={{ marginTop: '20px' }}
      >
        <AlertTriangle size={20} />
        SIMULATE CRISIS
      </button>

      {showAlert && (
        <div className="alert-overlay">
          <div className="alert-content">
            <div className="alert-icon">
              <AlertTriangle size={64} strokeWidth={2} />
            </div>
            <h2 className="alert-title">
              POSSIBLE VASO-OCCLUSIVE<br />CRISIS DETECTED
            </h2>
            
            {confirmations.length === 0 ? (
              <>
                <div className="alert-countdown">{countdown}</div>
                <div className="alert-buttons">
                  <button className="button button-secondary" onClick={handleDismiss}>
                    I'm okay, dismiss
                  </button>
                  <button className="button button-primary" onClick={handleGetHelp}>
                    Get help now
                  </button>
                </div>
              </>
            ) : (
              <div className="confirmation-cascade">
                {confirmations.map((msg, index) => (
                  <div key={index} className="confirmation-item">
                    <Check size={20} />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorTab;
