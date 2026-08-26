import os
import logging
import numpy as np
import joblib
from typing import Dict, List, Any, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

logger = logging.getLogger("campusmate.services.ml_engine")

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_FILE_PATH = os.path.join(MODEL_DIR, "job_eligibility_model.joblib")

_model: RandomForestClassifier | None = None

def _extract_features(
    candidate_skills: List[str],
    candidate_degree: str,
    ats_score: int,
    required_skills: List[str],
    preferred_degree: str | None = None
) -> Tuple[np.ndarray, List[str], List[str], float]:
    safe_cand_skills = [s for s in (candidate_skills or []) if s]
    safe_req_skills = [s for s in (required_skills or []) if s]
    safe_cand_degree = (candidate_degree or "").strip()
    safe_pref_degree = (preferred_degree or "").strip()

    cand_skills_lower = set(s.lower() for s in safe_cand_skills)
    req_skills_lower = set(s.lower() for s in safe_req_skills)

    if not req_skills_lower:
        matched = list(safe_cand_skills)
        missing = []
        ratio = 1.0
    else:
        matched_lower = cand_skills_lower.intersection(req_skills_lower)
        missing_lower = req_skills_lower - cand_skills_lower
        
        matched = [s for s in safe_req_skills if s.lower() in matched_lower]
        missing = [s for s in safe_req_skills if s.lower() in missing_lower]
        ratio = len(matched_lower) / len(req_skills_lower)

    # Degree alignment check
    degree_fit = 1.0
    if safe_pref_degree and safe_cand_degree:
        if safe_pref_degree.lower() in safe_cand_degree.lower():
            degree_fit = 1.0
        elif "computer" in safe_cand_degree.lower() or "science" in safe_cand_degree.lower():
            degree_fit = 0.8
        else:
            degree_fit = 0.5

    ats_score_norm = max(0.0, min(1.0, ats_score / 100.0))
    missing_count = float(len(missing))
    matched_count = float(len(matched))

    # Feature vector: [skill_match_ratio, matched_skill_count, degree_fit, ats_score_norm, missing_skill_count]
    feature_vector = np.array([ratio, matched_count, degree_fit, ats_score_norm, missing_count])
    return feature_vector, matched, missing, ratio

def train_and_save_model() -> Tuple[RandomForestClassifier, float, int]:
    """Generates synthetic dataset and trains a Scikit-Learn RandomForestClassifier model."""
    global _model
    logger.info("Training Scikit-Learn RandomForestClassifier for Job Eligibility...")

    np.random.seed(42)
    n_samples = 600

    # Generate synthetic features: [ratio, matched_count, degree_fit, ats_score_norm, missing_count]
    ratios = np.random.uniform(0.1, 1.0, n_samples)
    matched_counts = ratios * np.random.randint(3, 10, n_samples)
    degree_fits = np.random.choice([0.5, 0.8, 1.0], size=n_samples, p=[0.2, 0.3, 0.5])
    ats_scores_norm = np.random.uniform(0.3, 0.95, n_samples)
    missing_counts = np.random.randint(0, 6, n_samples)

    X = np.column_stack([ratios, matched_counts, degree_fits, ats_scores_norm, missing_counts])

    # Target ground truth label: 1 if high match skills & decent ATS score, else 0
    # Rule: Eligible if ratio >= 0.6 and ats_score_norm >= 0.5
    y = ((ratios * 0.5 + degree_fits * 0.2 + ats_scores_norm * 0.3) >= 0.55).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X_train, y_train)

    preds = rf.predict(X_test)
    accuracy = float(accuracy_score(y_test, preds))

    joblib.dump(rf, MODEL_FILE_PATH)
    _model = rf
    logger.info(f"RandomForestClassifier trained successfully! Accuracy: {accuracy * 100:.2f}%. Model saved to {MODEL_FILE_PATH}")
    return rf, accuracy, n_samples

def load_or_train_model() -> RandomForestClassifier:
    """Loads existing trained model from disk or trains a new model if missing."""
    global _model
    if _model is not None:
        return _model

    if os.path.exists(MODEL_FILE_PATH):
        try:
            _model = joblib.load(MODEL_FILE_PATH)
            logger.info(f"Loaded Scikit-Learn model from {MODEL_FILE_PATH}")
            return _model
        except Exception as e:
            logger.warning(f"Could not load saved model from disk: {e}. Re-training model.")

    rf, _, _ = train_and_save_model()
    return rf

def evaluate_job_eligibility(
    candidate_skills: List[str],
    candidate_degree: str,
    ats_score: int,
    job_id: str,
    job_title: str,
    company: str,
    required_skills: List[str],
    preferred_degree: str | None = None
) -> Dict[str, Any]:
    """Executes Random Forest ML inference to predict job match probability and eligibility classification."""
    model = load_or_train_model()
    features, matched, missing, ratio = _extract_features(
        candidate_skills, candidate_degree, ats_score, required_skills, preferred_degree
    )

    # ML Predict Probability for Class 1 (Eligible)
    prob = model.predict_proba([features])[0][1]
    score_percentage = round(float(prob * 100.0), 1)

    # Classification Binning
    if score_percentage >= 75.0:
        classification = "High Fit"
        note = "Excellent candidate alignment. Your skills match core role requirements."
    elif score_percentage >= 50.0:
        classification = "Moderate Fit"
        note = f"Good match potential. Adding missing skills ({', '.join(missing[:3])}) will boost your score above 85%."
    else:
        classification = "Unlikely Fit"
        note = f"Skill gap detected. Consider building projects in {', '.join(missing[:3])} before applying."

    return {
        "job_id": job_id,
        "job_title": job_title,
        "company": company,
        "eligibility_score": score_percentage,
        "classification": classification,
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_match_ratio": round(ratio, 2),
        "ats_score_used": ats_score,
        "recommendation_note": note
    }
