from django.contrib import admin
from .models import UserProfile, Prediction, AuditLog, Consent, FAQ, Hospital

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "prediction", "probability", "model_version", "created_at")
    list_filter = ("prediction",)

@admin.register(AuditLog)
class AuditAdmin(admin.ModelAdmin):
    list_display = ("id","user","path","method","ip","created_at")
    list_filter = ("method","path")

@admin.register(Consent)
class ConsentAdmin(admin.ModelAdmin):
    list_display = ("id","user","accepted","version","accepted_at")

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("id","question","order")

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id","name","phone")
