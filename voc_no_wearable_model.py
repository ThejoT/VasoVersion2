import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

# Set seed for reproducibility
np.random.seed(42)
n_samples = 5000

print("1. Generating synthetic clinical and self-reported patient dataset...")

# --- Synthetic Data Generation ---
# Patient Baseline Features
genotype_hbss = np.random.choice([1, 0], size=n_samples, p=[0.7, 0.3]) # 1 = HbSS (higher risk), 0 = HbSC/HbS-beta
prior_acs_history = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.4, 0.3, 0.2, 0.1]) # Prior Acute Chest Syndrome episodes
crises_past_year = np.random.poisson(lam=2.5, size=n_samples) # Historical crisis frequency

# Recent Biomarkers / Lab Values (e.g. from recent clinic checkup)
baseline_hb = np.clip(np.random.normal(7.5, 1.2, n_samples), 5.0, 12.0) # Hemoglobin (g/dL)
baseline_hbf = np.clip(np.random.normal(8.0, 4.0, n_samples), 1.0, 25.0) # Fetal Hemoglobin %

# Self-Reported Daily Check-in Features (Logged in App)
pain_score_1to10 = np.random.choice(range(1, 11), size=n_samples, p=[0.3, 0.25, 0.15, 0.1, 0.08, 0.05, 0.03, 0.02, 0.01, 0.01])
fatigue_level_1to5 = np.random.choice(range(1, 6), size=n_samples)
hydration_cups_today = np.clip(np.random.normal(6.0, 2.5, n_samples), 0, 15)
stress_level_1to5 = np.random.choice(range(1, 6), size=n_samples)
active_infection_fever = np.random.choice([0, 1], size=n_samples, p=[0.88, 0.12])

# Environmental Factors (e.g., pulled from Weather API using location)
temp_drop_24h_f = np.clip(np.random.normal(5.0, 8.0, n_samples), -10, 30) # Sudden temperature drop in °F
relative_humidity_pct = np.clip(np.random.normal(50, 20, n_samples), 10, 100)

# Target Variable Generation Logic (Probability of Crisis Onset in next 24-48h)
logits = (
    0.35 * (pain_score_1to10 >= 4) +
    0.45 * (active_infection_fever == 1) +
    0.30 * (hydration_cups_today < 4) +
    0.25 * (temp_drop_24h_f > 15) +
    0.20 * genotype_hbss +
    0.15 * prior_acs_history +
    0.10 * (fatigue_level_1to5 >= 4) +
    0.10 * (baseline_hb < 7.0) -
    0.02 * baseline_hbf +
    np.random.normal(0, 0.3, n_samples)
)

# Convert logits to binary target (1 = Crisis Impending / High Risk, 0 = Low Risk)
prob = 1 / (1 + np.exp(-logits))
crisis_target = (prob > 0.55).astype(int)

# Create Pandas DataFrame
df = pd.DataFrame({
    'genotype_hbss': genotype_hbss,
    'prior_acs_history': prior_acs_history,
    'crises_past_year': crises_past_year,
    'baseline_hb': baseline_hb,
    'baseline_hbf': baseline_hbf,
    'pain_score': pain_score_1to10,
    'fatigue_level': fatigue_level_1to5,
    'hydration_cups': hydration_cups_today,
    'stress_level': stress_level_1to5,
    'infection_fever': active_infection_fever,
    'temp_drop_24h': temp_drop_24h_f,
    'humidity_pct': relative_humidity_pct,
    'crisis_imminent': crisis_target
})

# --- Model Training & Validation ---
print("2. Splitting dataset into training and test sets...")
X = df.drop('crisis_imminent', axis=1)
y = df['crisis_imminent']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("3. Training Gradient Boosting Classifier...")
model = GradientBoostingClassifier(
    n_estimators=150,
    learning_rate=0.08,
    max_depth=4,
    random_state=42
)
model.fit(X_train, y_train)

# --- Evaluation ---
y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("\n" + "="*50)
print("MODEL EVALUATION RESULTS")
print("="*50)
print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred, target_names=['Low Risk', 'Crisis Risk']))

# --- Save Trained Model Artifact ---
joblib.dump(model, 'voc_no_wearable_model.pkl')
print("Saved model to 'voc_no_wearable_model.pkl'")

# --- Real-Time Patient Risk Inference Function ---
def evaluate_patient_voc_risk(patient_profile):
    """
    Evaluates a patient's risk profile without needing a wearable.
    
    Expected keys in patient_profile dict:
    ['genotype_hbss', 'prior_acs_history', 'crises_past_year', 'baseline_hb', 
     'baseline_hbf', 'pain_score', 'fatigue_level', 'hydration_cups', 
     'stress_level', 'infection_fever', 'temp_drop_24h', 'humidity_pct']
    """
    input_df = pd.DataFrame([patient_profile])
    risk_prob = model.predict_proba(input_df)[0][1]
    
    if risk_prob >= 0.70:
        risk_level = "CRITICAL / HIGH RISK"
        recommendation = "High risk of vaso-occlusive crisis. Increase oral hydration, rest, and contact care team or visit Infusion Center."
    elif risk_prob >= 0.40:
        risk_level = "MODERATE RISK"
        recommendation = "Elevated risk detected. Track symptoms closely, avoid cold exposure, and stay hydrated."
    else:
        risk_level = "LOW RISK"
        recommendation = "Vitals and symptom log stable. Continue daily protocol."
        
    return {
        'risk_probability': round(float(risk_prob), 4),
        'risk_level': risk_level,
        'recommendation': recommendation
    }

# --- Example Evaluation (Patient Maya Johnson) ---
print("\n" + "="*50)
print("PATIENT TEST INFERENCE: Maya Johnson")
print("="*50)

maya_today_log = {
    'genotype_hbss': 1,           # HbSS genotype
    'prior_acs_history': 2,       # 2 prior ACS episodes
    'crises_past_year': 3,        # 3 crises past year
    'baseline_hb': 7.2,           # Hemoglobin
    'baseline_hbf': 6.5,          # Fetal Hemoglobin
    'pain_score': 6,              # Self-reported mild-moderate onset pain (6/10)
    'fatigue_level': 4,           # High fatigue
    'hydration_cups': 3.0,        # Under-hydrated
    'stress_level': 3,            # Moderate stress
    'infection_fever': 0,         # No fever
    'temp_drop_24h': 18.0,        # Cold front dropped temp by 18°F
    'humidity_pct': 35.0          # Low humidity
}

result = evaluate_patient_voc_risk(maya_today_log)
print(f"Risk Probability: {result['risk_probability'] * 100:.1f}%")
print(f"Status Category : {result['risk_level']}")
print(f"Clinical Prompt  : {result['recommendation']}")
