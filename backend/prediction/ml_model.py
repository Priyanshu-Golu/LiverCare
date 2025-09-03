import os
import joblib
import numpy as np

# Paths to saved model and features
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models_store", "liver_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "models_store", "feature_names.pkl")

def load_pipeline():
    """
    Load trained model (CatBoost/XGBoost/LightGBM/Ensemble) and feature names.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}")
    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(f"Feature names not found at {FEATURES_PATH}")

    model = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURES_PATH)  # list of feature names
    return model, features

def predict_with_saved_model(features_list):
    """
    Run prediction using saved multiclass model.
    Returns (predicted_stage, class_probs, feature_names).
    """
    model, feature_names = load_pipeline()

    if len(features_list) != len(feature_names):
        raise ValueError(f"Expected {len(feature_names)} features in order {feature_names}, "
                         f"but got {len(features_list)}")

    arr = np.array(features_list, dtype=float).reshape(1, -1)

    # Predicted stage (1–4)
    pred_stage = int(model.predict(arr)[0])

    # Probabilities for each stage
    probas = None
    if hasattr(model, "predict_proba"):
        probas = model.predict_proba(arr)[0].tolist()

    return pred_stage, probas, feature_names
