from django.urls import path
from .views import (
    predict_liver, get_feature_names, RegisterView, PredictionListView, export_predictions_csv,
    faqs_list, hospitals_list, consent_status, consent_accept, admin_metrics
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("features/", get_feature_names),
    path("predict/", predict_liver),
    path("predictions/", PredictionListView.as_view()),
    path("predictions/export/", export_predictions_csv),
    path("faqs/", faqs_list),
    path("hospitals/", hospitals_list),
    path("consent/status/", consent_status),
    path("consent/accept/", consent_accept),
    path("admin/metrics/", admin_metrics),
]
