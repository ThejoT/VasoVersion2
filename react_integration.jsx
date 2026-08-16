// Add this as a new component: src/components/RiskPredictionTab.jsx

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const RiskPredictionTab = ({ patientData, vitals, painLogs }) => {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riskHistory, setRiskHistory] = useState([]);

  // Calculate risk on component mount and when data changes
  useEffect(() => {
    calculateRisk();
  }, [painLogs, vitals]);

  const calculateRisk = async () => {
    setLoading(true);
    setError(null);

    // Get latest pain log or use defaults
    const latestPainLog = painLogs[0];
    const yesterdayPainLog = painLogs[1];

    // Construct patient profile
    const patientProfile = {
      // Baseline (from patientData)
      genotype_hbss: 1, // Maya is HbSS
      prior_acs_history: patientData.riskFactors.acuteChestSyndrome,
      crises_past_year: 2,
      baseline_hb: 7.2,
      baseline_hbf: 6.5,
      on_hydroxyurea: 1,
      recent_transfusion_days: 999,
      medication_adherence_pct: 85,

      // Current symptoms
      pain_score: latestPainLog?.pain || 0,
      pain_yesterday: yesterdayPainLog?.pain || 0,
      fatigue_level: 3,
      hydration_cups: 5.0,
      hydration_yesterday: 6.0,
      stress_level: 3,
      sleep_quality: 3,
      infection_fever: vitals.temperature > 100.4 ? 1 : 0,
      menstrual_phase: 0,

      // Environmental (from weather API - mock for now)
      temp_drop_24h: 10.0,
      humidity_pct: 45.0,
      altitude_change_ft: 0,

      // Engineered features
      pain_trend: latestPainLog && yesterdayPainLog 
        ? latestPainLog.pain - yesterdayPainLog.pain 
        : 0,
      hydration_deficit: 5.0 < 4 ? 1 : 0,
      consecutive_dehydration: 0,
    };

    try {
      // Option 1: Call API (if deployed)
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientProfile),
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      setRiskData(data);

      // Add to history
      setRiskHistory(prev => [
        { date: new Date(), risk: data.risk_percentage },
        ...prev.slice(0, 6) // Keep last 7 days
      ]);

    } catch (err) {
      // Option 2: Client-side calculation (fallback)
      const localRisk = calculateLocalRisk(patientProfile);
      setRiskData(localRisk);
    } finally {
      setLoading(false);
    }
  };

  // Simplified local risk calculation (fallback when API unavailable)
  const calculateLocalRisk = (profile) => {
    let riskScore = 0;

    // Simple heuristic-based scoring
    if (profile.pain_score >= 5) riskScore += 0.25;
    if (profile.infection_fever === 1) riskScore += 0.30;
    if (profile.hydration_cups < 4) riskScore += 0.20;
    if (profile.temp_drop_24h > 15) riskScore += 0.15;
    if (profile.pain_trend >= 2) riskScore += 0.20;
    if (profile.prior_acs_history >= 2) riskScore += 0.15;

    const risk_percentage = Math.min(riskScore * 100, 95);
    
    let risk_level = 'LOW';
    let recommendation = '✓ Stable';
    
    if (risk_percentage >= 65) {
      risk_level = 'CRITICAL';
      recommendation = '⚠️ HIGH RISK - Contact care team';
    } else if (risk_percentage >= 40) {
      risk_level = 'MODERATE';
      recommendation = '⚠️ Monitor closely';
    } else if (risk_percentage >= 25) {
      risk_level = 'WATCH';
      recommendation = '⚡ Track symptoms';
    }

    return {
      risk_percentage,
      risk_level,
      recommendation,
      risk_factors: []
    };
  };

  const getRiskColor = () => {
    if (!riskData) return '#9ca3af';
    if (riskData.risk_percentage >= 65) return '#dc2626';
    if (riskData.risk_percentage >= 40) return '#f59e0b';
    if (riskData.risk_percentage >= 25) return '#fbbf24';
    return '#10b981';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Activity size={48} className="animate-spin" style={{ color: '#dc2626', margin: '0 auto' }} />
        <p style={{ marginTop: '16px', color: '#9ca3af' }}>Analyzing risk factors...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">Crisis Risk Prediction</h1>

      {/* Main Risk Score Card */}
      <div className="card" style={{ 
        borderColor: getRiskColor(), 
        borderWidth: '3px',
        marginBottom: '24px' 
      }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ 
            fontSize: '72px', 
            fontWeight: '700', 
            color: getRiskColor(),
            lineHeight: '1'
          }}>
            {riskData ? `${riskData.risk_percentage}%` : '--'}
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#f9fafb',
            marginTop: '12px' 
          }}>
            {riskData?.risk_level || 'CALCULATING...'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#9ca3af',
            marginTop: '8px' 
          }}>
            24-48 Hour Crisis Probability
          </div>
        </div>

        {riskData && (
          <div className="banner" style={{
            backgroundColor: getRiskColor() + '20',
            borderColor: getRiskColor(),
            color: '#f9fafb',
            marginTop: '16px'
          }}>
            {riskData.recommendation}
          </div>
        )}
      </div>

      {/* Risk Factors Breakdown */}
      {riskData && riskData.risk_factors && riskData.risk_factors.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 className="section-subtitle" style={{ marginTop: 0 }}>Risk Factors Identified</h3>
          {riskData.risk_factors.map((factor, idx) => (
            <div key={idx} style={{
              padding: '12px',
              backgroundColor: '#1a2332',
              borderRadius: '8px',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              {factor}
            </div>
          ))}
        </div>
      )}

      {/* Risk Trend Graph */}
      {riskHistory.length > 1 && (
        <div className="card">
          <h3 className="section-subtitle" style={{ marginTop: 0 }}>7-Day Risk Trend</h3>
          <div style={{ height: '120px', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
              <polyline
                points={riskHistory.reverse().map((point, idx) => 
                  `${idx * 50},${100 - point.risk}`
                ).join(' ')}
                fill="none"
                stroke={getRiskColor()}
                strokeWidth="3"
              />
            </svg>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#9ca3af',
            marginTop: '8px'
          }}>
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <button 
        className="button button-primary"
        onClick={calculateRisk}
        style={{ marginTop: '20px' }}
      >
        <TrendingUp size={20} />
        Recalculate Risk
      </button>

      {riskData && riskData.risk_percentage >= 40 && (
        <button 
          className="button button-secondary"
          onClick={() => alert('Opening care resources...')}
          style={{ marginTop: '12px' }}
        >
          View Care Options
        </button>
      )}
    </div>
  );
};

export default RiskPredictionTab;
