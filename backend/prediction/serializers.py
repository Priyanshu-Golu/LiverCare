from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Prediction, FAQ, Hospital, Consent, UserProfile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=[("PATIENT","Patient"),("CLINICIAN","Clinician")], default="PATIENT")

    class Meta:
        model = User
        fields = ("username","email","password","role")

    def create(self, validated_data):
        role = validated_data.pop("role", "PATIENT")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"]
        )
        # create profile
        UserProfile.objects.create(user=user, role=role)
        return user

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prediction
        fields = "__all__"
        read_only_fields = ("id","created_at","user","model_version")

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"

class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = "__all__"

class ConsentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consent
        fields = "__all__"
        read_only_fields = ("user","accepted_at")
