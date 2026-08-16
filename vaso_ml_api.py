"""
Flask API for VOC Crisis Prediction Model
Deploy with: python vaso_ml_api.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

# Load model artifacts
MODEL_PATH = 'voc_crisis_model_v2.pkl'
FEATURES_PATH = 'feature_names.pkl'

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model = joblib.load(MODEL_PATH)
feature_names = joblib.load(FEATURES_PATH)

print(f"✓ Loaded model from {MODEL_PATH}")
print(f"✓ Model expects {len(feature_names)} features")

def validate_input(data):
    """Validate input data structure and ranges"""
    required_fields = feature_names
    missing = [f for f in required_fields if f not in data]
    
    if missing:
        return False, f"Missing required fields: {', '.join(missing[:5])}"
    
    # Range validations
    validations = {
        'pain_score': (0, 10),
        'pain_yesterday': (0, 10),
        'fatigue_level': (1, 5),
        'stress_level': (1, 5),
        'sleep_quality': (1, 5),
        'hydration_cups': (0, 20),
        'baseline_hb': (4, 15),
        'baseline_hbf': (0, 30),
        'temp_drop_24h': (-20, 40),
        'humidity_pct': (0, 100),
    }
    
    for field, (min_val, max_val) in validations.items():
        if field in data:
            val = data[field]
            if not (min_val <= val <= max_val):
                return False, f"{field} must be between {min_val} and {max_val}"
    
    return True, None

def predict_risk(patient_data):
    """Generate risk prediction with explanation"""
    
    # Validate input
    is_valid, error_msg = validate_input(patient_data)
    if not is_valid:
        return {'error': error_msg}, 400
    
    # Create DataFrame
    input_df = pd.DataFrame([patient_data])
    input_df = input_df[feature_names]  # Ensure correct order
    
    # Predict
    risk_prob = float(model.predict_proba(input_df)[0][1])
    
    # Risk stratification
    if risk_prob >= 0.65:
        risk_level = "CRITICAL"
        recommendation = "⚠️ HIGH CRISIS RISK. Contact care team or visit infusion center immediately."
    elif risk_prob >= 0.40:
        risk_level = "MODERATE"
        recommendation = "⚠️ Elevated risk. Monitor closely and increase hydration."
    elif risk_prob >= 0.25:
        risk_level = "WATCH"
        recommendation = "⚡ Slight elevation. Track symptoms carefully."
    else:
        risk_level = "LOW"
        recommendation = "✓ Stable. Continue preventive care."
    
    # Generate risk factors
    risk_factors = []
    if patient_data.get('pain_score', 0) >= 5:
        risk_factors.append(f"High pain: {patient_data['pain_score']}/10")
    if patient_data.get('infection_fever', 0) == 1:
        risk_factors.append("Active infection/fever")
    if patient_data.get('hydration_cups', 10) < 4:
        risk_factors.append(f"Low hydration: {patient_data['hydration_cups']} cups")
    if patient_data.get('temp_drop_24h', 0) > 15:
        risk_factors.append(f"Cold exposure: {patient_data['temp_drop_24h']}°F drop")
    if patient_data.get('pain_trend', 0) >= 2:
        risk_factors.append("Pain increasing rapidly")
    
    return {
        'risk_probability': round(risk_prob, 4),
        'risk_percentage': round(risk_prob * 100, 1),
        'risk_level': risk_level,
        'recommendation': recommendation,
        'risk_factors': risk_factors,
        'timestamp': datetime.now().isoformat()
    }, 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'feature_count': len(feature_names)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        result, status_code = predict_risk(data)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    """Batch prediction for multiple patients"""
    try:
        data = request.get_json()
        patients = data.get('patients', [])
        
        if not patients:
            return jsonify({'error': 'No patients provided'}), 400
        
        results = []
        for idx, patient in enumerate(patients):
            result, _ = predict_risk(patient)
            result['patient_id'] = patient.get('patient_id', f'patient_{idx}')
            results.append(result)
        
        return jsonify({'predictions': results}), 200
        
    except Exception as e:
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500

@app.route('/api/features', methods=['GET'])
def get_features():
    """Return list of required features"""
    return jsonify({
        'features': feature_names,
        'count': len(feature_names)
    })

@app.route('/api/model/info', methods=['GET'])
def model_info():
    """Return model metadata"""
    return jsonify({
        'model_version': 'v2.0',
        'model_type': 'Gradient Boosting Classifier',
        'feature_count': len(feature_names),
        'deployment_date': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("
" + "="*60)
    print("VASO ML API Server Starting...")
    print("="*60)
    print("Endpoints:")
    print("  GET  /health              - Health check")
    print("  POST /api/predict         - Single prediction")
    print("  POST /api/predict/batch   - Batch prediction")
    print("  GET  /api/features        - List features")
    print("  GET  /api/model/info      - Model metadata")
    print("="*60)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
