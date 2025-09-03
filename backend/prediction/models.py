from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = (
        ("PATIENT", "Patient"),
        ("CLINICIAN", "Clinician"),
        ("ADMIN", "Admin"),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="PATIENT")

    def __str__(self):
        return f"{self.user.username} ({self.role})"

class Prediction(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    features = models.JSONField()
    prediction = models.IntegerField()
    probability = models.FloatField(null=True, blank=True)
    model_version = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pred {self.id} - {self.prediction} @ {self.created_at.isoformat()}"

class AuditLog(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    path = models.CharField(max_length=300)
    method = models.CharField(max_length=10)
    body = models.JSONField(null=True, blank=True)
    ip = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audit {self.method} {self.path} @ {self.created_at.isoformat()}"

class Consent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)
    version = models.CharField(max_length=50, default="v1")
    accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Consent {self.user} - {self.accepted} @ {self.accepted_at}"

class FAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.question

class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name
