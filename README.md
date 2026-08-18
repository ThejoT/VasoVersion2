

# Vaso — Sickle Cell Crisis Companion & Predictive Platform

**Vaso** is an integrated clinical decision-support and patient-facing digital health platform engineered to predict, monitor, and manage Vaso-Occlusive Crises (VOC) in Sickle Cell Disease (SCD) patients.

By unifying continuous vital sign tracking, patient self-reports, baseline biomarkers, and localized environmental risk factors, Vaso enables early-warning risk stratification **without requiring external wearable hardware**.

---

## Table of Contents

* [Key Features & Architecture](https://www.google.com/search?q=%23-key-features--architecture)
* [System Components](https://www.google.com/search?q=%23-system-components)
* [Tech Stack](https://www.google.com/search?q=%23-tech-stack)
* [Repository Structure](https://www.google.com/search?q=%23-repository-structure)
* [Getting Started](https://www.google.com/search?q=%23-getting-started)
* [Frontend Setup](https://www.google.com/search?q=%231-frontend-setup-react--vite)
* [Backend & ML Setup](https://www.google.com/search?q=%232-backend--ml-setup-python--flask)


* [Machine Learning Engine (`v2.0`)](https://www.google.com/search?q=%23-machine-learning-engine-v20)
* [Flask REST API Reference](https://www.google.com/search?q=%23-flask-rest-api-reference)
* [Clinical Guidelines & Compliance](https://www.google.com/search?q=%23-clinical-guidelines--compliance)

---

## 🌟 Key Features & Architecture

### 📱 **React Mobile Web Companion**

* **Monitor Tab**: Streamlined real-time vital display (SpO₂, Heart Rate, Body Temp, HRV) with interactive 20-sample sparklines, natural physiological drift, and a dedicated **"SIMULATE CRISIS"** mode for clinical demonstration.
* **Crisis Action Tab**: Immediate crisis response toolkit featuring multi-location body region pain logging (1–10 scale) and direct emergency contact dispatch.
* **ER Handoff Card Tab**: Verified, emergency-ready Individualized Analgesia Protocol with full-screen presentation mode, hematologist verification, and QR code integration.
* **Care Intelligence Tab**: Real-time side-by-side facility comparison (Infusion Centers vs. Emergency Departments) with average time-to-analgesia, copay breakdowns, and insurance prior-authorization tracking.
* **Log & History Tab**: Historical crisis tracking, average duration analytics, and printable PDF summary generation for hematology follow-ups.

### 🤖 **Predictive ML Platform**

* **Wearable-Free Risk Model**: Uses a 25-feature Gradient Boosting Classifier trained on clinical baselines, daily patient-reported logs, and weather changes.
* **Environmental & Temporal Triggers**: Analyzes 24-hour temperature drops, humidity, altitude changes, pain trends, and hydration deficits.

---

## 🛠️ Tech Stack

| Layer | Technologies / Libraries |
| --- | --- |
| **Frontend UI** | React 18, Vite, Lucide React Icons |
| **Styling** | Custom Mobile-First CSS (`#0a1628` Dark Medical Theme, `#dc2626` Crimson Accent) |
| **Backend API** | Python 3.9+, Flask, Flask-CORS |
| **Machine Learning** | scikit-learn (Gradient Boosting Classifier), NumPy, Pandas, Joblib |
| **Data Viz & Analytics** | Matplotlib, Seaborn |

---

## 📁 Repository Structure

```text
vaso/
├── index.html                  # HTML5 application root
├── package.json                # Frontend dependencies & npm scripts
├── vite.config.js              # Vite build configuration
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
│
├── src/                        # React Application Source
│   ├── main.jsx                # Application mount point
│   ├── App.jsx                 # Application state container & navigation
│   ├── index.css               # Global dark medical UI styles & tokens
│   └── components/             # React Tab Components
│       ├── MonitorTab.jsx      # Live vitals & crisis simulation engine
│       ├── CrisisTab.jsx       # Pain logging & care team messaging
│       ├── CardTab.jsx         # Fullscreen ER handoff care protocol
│       ├── CareTab.jsx         # Infusion center vs. ED routing & insurance
│       ├── LogTab.jsx          # Historical crisis analytics
│       └── RiskPredictionTab.jsx # Interactive ML risk assessment UI
│
├── vaso_ml_api.py              # Production Flask REST API
├── voc_crisis_prediction_v2.py # Production ML training & pipeline script
├── voc_no_wearable_model.py    # Prototype ML script
├── README_ML.md                # ML model technical specification
└── START.md                    # System quickstart guide

```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: `v18.0.0+`
* **npm**: `v9.0.0+`
* **Python**: `v3.9+`

---

### 1. Frontend Setup (React + Vite)

```bash
# Clone repository
git clone https://github.com/your-org/vaso.git
cd vaso

# Install JavaScript dependencies
npm install

# Start Vite development server
npm run dev

```

> The web application will launch at `http://localhost:5173`.

---

### 2. Backend & ML Setup (Python + Flask)

```bash
# Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python requirements
pip install -r requirements.txt

# Train model and export artifacts (voc_crisis_model_v2.pkl & feature_names.pkl)
python voc_crisis_prediction_v2.py

# Launch Flask API Server
python vaso_ml_api.py

```

> The ML API server will run at `http://127.0.0.1:5000`.

---

## 📊 Machine Learning Engine (`v2.0`)

The model uses a **Gradient Boosting Classifier** calibrated to predict VOC risk probabilities without requiring wearable device telemetry.

### Risk Stratification Matrix

| Risk Level | Probability Threshold | Actionable Clinical Guidance |
| --- | --- | --- |
| 🚨 **CRITICAL** | `≥ 65%` | High risk of imminent VOC. Contact care team or proceed to infusion center immediately. |
| ⚠️ **MODERATE** | `40% – 64%` | Elevated risk. Increase oral hydration, avoid cold exposure, and monitor symptoms. |
| ⚡ **WATCH** | `25% – 39%` | Slight risk elevation. Track symptoms carefully over the next 24 hours. |
| ✅ **LOW** | `< 25%` | Patient stable. Baseline daily protocol maintained. |

---

## 📡 Flask REST API Reference

### Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Server health check |
| `GET` | `/api/model/info` | Returns model version, feature count, and deployment metadata |
| `GET` | `/api/features` | Returns list of 25 expected input feature names |
| `POST` | `/api/predict` | Computes VOC risk score and recommendations for a single patient |
| `POST` | `/api/predict/batch` | Computes VOC risk scores for a batch of patient profiles |

### Example Request (`POST /api/predict`)

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "genotype_hbss": 1,
    "prior_acs_history": 2,
    "crises_past_year": 2,
    "baseline_hb": 7.2,
    "baseline_hbf": 6.5,
    "on_hydroxyurea": 1,
    "recent_transfusion_days": 999,
    "medication_adherence_pct": 85,
    "pain_score": 6,
    "pain_yesterday": 3,
    "fatigue_level": 4,
    "hydration_cups": 3,
    "hydration_yesterday": 4,
    "stress_level": 3,
    "sleep_quality": 3,
    "infection_fever": 0,
    "menstrual_phase": 0,
    "temp_drop_24h": 18.0,
    "humidity_pct": 45,
    "altitude_change_ft": 0,
    "pain_trend": 3,
    "hydration_deficit": 1,
    "consecutive_dehydration": 1
  }'

```

---

## ⚖️ Clinical Guidelines & Compliance

Vaso integrates key evidence-based medical standards into its ER Handoff Card and care workflows:

* **ASH 2020 Guidelines**: Emphasizes rapid administration of individualized analgesia within 60 minutes of arrival for acute pain crises.
* **CDC 2022 Opioid Guideline**: Explicitly clarifies that recommendations for chronic pain management do not apply to acute pain management in Sickle Cell Disease.

## 🌐 Demos & Live Previews

- 🚀 **Live Interactive Web App**: [vaso-care-flow.base44.app ](https://vaso-care-flow.base44.app/) 
- Slides [Vaso - A Sickle Cell Crisis Companion.pdf](https://github.com/user-attachments/files/31160446/Vaso.-.A.Sickle.Cell.Crisis.Companion.pdf)
<img width="525" height="300" alt="vaso-wallet-card-print-3 5x2in" src="https://github.com/user-attachments/assets/f940cf34-14b8-4f22-950a-0115179b3149" />

- 📹 **Video Walkthrough**: [[Watch on YouTube](https://youtube.com/watch?v=your-video-id)](https://www.youtube.com/watch?v=tpyW0Iz8Pwg)

### 📽️ Pictures of App Interface 
| Live Vital Monitoring & Crisis Drift | ER Handoff Protocol Card |
| :---: | :---: |
| ![Vaso Monitor Demo](assets/monitor-demo.gif) | ![Vaso Card Demo](assets/card-demo.gif) |

<img width="691" height="1315" alt="Screenshot 2026-08-16 145441" src="https://github.com/user-attachments/assets/a7cf806e-779f-430c-bc6d-536619f64a38" />
<img width="686" height="1273" alt="Screenshot 2026-08-16 145437" src="https://github.com/user-attachments/assets/b615d853-1524-43f9-8f85-0ae88431790d" />
<img width="664" height="1294" alt="Screenshot 2026-08-16 145422" src="https://github.com/user-attachments/assets/a8d60922-34c9-4a8e-bcc2-2cbe27ca4771" />
<img width="658" height="1266" alt="Screenshot 2026-08-16 145416" src="https://github.com/user-attachments/assets/93640bcc-3dfd-4a14-9a00-03cbcfe22414" />
<img width="720" height="1274" alt="Screenshot 2026-08-16 145451" src="https://github.com/user-attachments/assets/404f140e-3a26-40a5-9522-8aba59795a29" />
<img width="670" height="1270" alt="Screenshot 2026-08-16 145447" src="https://github.com/user-attachments/assets/4c43d08e-ddcb-4674-8b61-d21a237fc955" />



---

## 📄 License

This repository is distributed under the MIT License. See `LICENSE` for details.
