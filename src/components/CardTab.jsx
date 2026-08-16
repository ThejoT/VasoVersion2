import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Maximize2, Minimize2, QrCode } from 'lucide-react';

const CardTab = ({ patientData, vitals }) => {
  const [fullscreen, setFullscreen] = useState(false);

  const CardContent = () => (
    <>
      <div className="care-card-header">
        <ShieldCheck size={32} />
        <div>
          <div className="care-card-title">Verified Individualized Care Plan</div>
        </div>
      </div>

      <div className="patient-info">
        {patientData.name} · {patientData.age} · {patientData.genotype} · Vaso-Occlusive Crisis Protocol
      </div>

      <div className="protocol-box">
        <div className="protocol-title">INDIVIDUALIZED ANALGESIA PROTOCOL ON FILE</div>
        <div className="protocol-text">
          {patientData.hematologist.name}, {patientData.hematologist.title}
          <br />
          {patientData.hematologist.facility}
          <br />
          <strong>Verify: {patientData.hematologist.phone}</strong>
        </div>
      </div>

      <div className="banner banner-danger" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>ACUTE CHEST SYNDROME RISK</strong> — {patientData.riskFactors.acuteChestSyndrome} prior episodes.
            Check SpO2 and chest X-ray.
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f9fafb', marginBottom: '12px' }}>
          Current Vitals
        </h3>
      </div>

      <div className="vitals-grid">
        <div className="vital-mini">
          <div className="vital-mini-label">SpO2</div>
          <div className="vital-mini-value" style={{ color: vitals.spo2 < 92 ? '#dc2626' : '#f9fafb' }}>
            {vitals.spo2.toFixed(1)}%
          </div>
        </div>
        <div className="vital-mini">
          <div className="vital-mini-label">Heart Rate</div>
          <div className="vital-mini-value" style={{ color: vitals.heartRate > 110 ? '#dc2626' : '#f9fafb' }}>
            {Math.round(vitals.heartRate)} bpm
          </div>
        </div>
        <div className="vital-mini">
          <div className="vital-mini-label">Temperature</div>
          <div className="vital-mini-value" style={{ color: vitals.temperature > 100.4 ? '#dc2626' : '#f9fafb' }}>
            {vitals.temperature.toFixed(1)}°F
          </div>
        </div>
        <div className="vital-mini">
          <div className="vital-mini-label">HRV</div>
          <div className="vital-mini-value" style={{ color: vitals.hrv < 45 ? '#dc2626' : '#f9fafb' }}>
            {Math.round(vitals.hrv)} ms
          </div>
        </div>
      </div>

      <div className="qr-placeholder">
        <div>
          <QrCode size={80} strokeWidth={1.5} />
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Scan for full record</div>
        </div>
      </div>

      <div className="footer-text">
        <strong>Evidence-based care:</strong> ASH 2020 Guidelines recommend analgesia within 60 minutes
        and use of individualized pain plans. CDC 2022 Opioid Guideline explicitly excludes sickle cell disease.
      </div>

      <div className="signature">
        Signed 2026-03-14 · NPI verified
      </div>

      {!fullscreen && (
        <button
          className="button button-primary"
          onClick={() => setFullscreen(true)}
          style={{ marginTop: '24px' }}
        >
          <Maximize2 size={20} />
          Fullscreen for ER staff
        </button>
      )}
    </>
  );

  if (fullscreen) {
    return (
      <div className="fullscreen-card">
        <button
          className="button button-secondary"
          onClick={() => setFullscreen(false)}
          style={{ marginBottom: '20px' }}
        >
          <Minimize2 size={20} />
          Exit Fullscreen
        </button>
        <CardContent />
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">Care Card</h1>
      <CardContent />
    </div>
  );
};

export default CardTab;
