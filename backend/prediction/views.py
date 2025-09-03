import json
import csv
import numpy as np
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response

from .ml_model import predict_with_saved_model , load_pipeline
from .models import Prediction, Consent, FAQ, Hospital
from .serializers import (
    PredictionSerializer,
    RegisterSerializer,
    FAQSerializer,
    HospitalSerializer,
    ConsentSerializer,
)

# ------------------ Authentication ------------------

class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# ------------------ Get Features -------------------

from .ml_model import load_pipeline

@api_view(['GET'])
def get_feature_names(request):
    """
    Return list of feature names expected by the model.
    """
    try:
        _, feature_names = load_pipeline()
        return Response({"features": feature_names})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

    # If successful, return the feature names
    return Response({"features": feature_names})        

@api_view(['POST'])
def predict_liver(request):
    """
    Predict liver cirrhosis stage (1–4).
    Expects JSON: { "features": [val1, val2, ...] }
    """
    features_list = request.data.get("features")
    if not features_list:
        return Response({"error": "Provide 'features' as a list"}, status=400)

    try:
        stage, probas, feature_names = predict_with_saved_model(features_list)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

    user = request.user if request.user.is_authenticated else None
    record = Prediction.objects.create(
        user=user,
        features=features_list,
        prediction=stage,  # save stage number
        probability=max(probas) if probas else None,
        model_version="offline_v1"
    )

    serializer = PredictionSerializer(record)

    return Response({
        "predicted_stage": stage,
        "probabilities": {
            f"Stage_{i+1}": p for i, p in enumerate(probas)
        } if probas else None,
        "record": serializer.data
    })


class PredictionListView(generics.ListAPIView):
    """
    List predictions:
    - Patient → their own
    - Clinician/Admin → all
    """
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        profile = getattr(self.request.user, "profile", None)
        role = profile.role if profile else None

        if role == "PATIENT":
            return Prediction.objects.filter(user=self.request.user).order_by('-created_at')
        elif role in ("CLINICIAN", "ADMIN"):
            return Prediction.objects.all().order_by('-created_at')
        return Prediction.objects.none()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_predictions_csv(request):
    """
    Export predictions as CSV
    """
    profile = getattr(request.user, "profile", None)
    role = profile.role if profile else None

    if role == "PATIENT":
        qs = Prediction.objects.filter(user=request.user).order_by('-created_at')
    elif role in ("CLINICIAN", "ADMIN"):
        qs = Prediction.objects.all().order_by('-created_at')
    else:
        return Response({"detail": "Not authorized"}, status=403)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="predictions.csv"'
    writer = csv.writer(response)
    writer.writerow(['id', 'created_at', 'prediction', 'probability', 'model_version', 'features'])
    for p in qs:
        writer.writerow([p.id, p.created_at.isoformat(), p.prediction, p.probability, p.model_version, json.dumps(p.features)])
    return response


# ------------------ FAQs & Hospitals ------------------

@api_view(['GET'])
def faqs_list(request):
    """
    Public FAQs
    """
    faqs = FAQ.objects.all().order_by('order')
    serializer = FAQSerializer(faqs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def hospitals_list(request):
    """
    Public hospital locator
    """
    hs = Hospital.objects.all()
    serializer = HospitalSerializer(hs, many=True)
    return Response(serializer.data)


# ------------------ Consent ------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def consent_status(request):
    """
    Get user's consent status
    """
    try:
        c = Consent.objects.get(user=request.user)
        serializer = ConsentSerializer(c)
        return Response(serializer.data)
    except Consent.DoesNotExist:
        return Response({"accepted": False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def consent_accept(request):
    """
    Accept consent
    """
    version = request.data.get('version', 'v1')
    c, created = Consent.objects.get_or_create(user=request.user, defaults={'accepted': True, 'version': version})

    if not created:
        c.accepted = True
        c.version = version

    import datetime
    c.accepted_at = datetime.datetime.utcnow()
    c.save()

    serializer = ConsentSerializer(c)
    return Response(serializer.data)


# ------------------ Admin Metrics ------------------

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_metrics(request):
    """
    Admin-only system metrics
    """
    total_preds = Prediction.objects.count()
    total_users = User.objects.count()
    recent_preds = Prediction.objects.order_by('-created_at')[:10].values(
        'id', 'user_id', 'prediction', 'probability', 'created_at'
    )

    return Response({
        "total_predictions": total_preds,
        "total_users": total_users,
        "recent_predictions": list(recent_preds)
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "role": getattr(user, "role", "patient")  # if role exists
    })
