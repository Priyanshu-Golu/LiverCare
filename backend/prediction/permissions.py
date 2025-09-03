from rest_framework.permissions import BasePermission

class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile") and request.user.profile.role == "PATIENT"

class IsClinician(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile") and request.user.profile.role == "CLINICIAN"

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, "profile") and request.user.profile.role == "ADMIN"
