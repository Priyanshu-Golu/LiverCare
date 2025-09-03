import json
from .models import AuditLog

class AuditMiddleware:
    """
    Logs API requests to AuditLog for /api/ paths.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            if request.path.startswith("/api/"):
                body = None
                try:
                    if request.body:
                        body_str = request.body.decode("utf-8")
                        body = json.loads(body_str)
                except Exception:
                    body = None
                user = None
                try:
                    if hasattr(request, "user") and request.user.is_authenticated:
                        user = request.user
                except Exception:
                    user = None
                AuditLog.objects.create(
                    user=user,
                    path=request.path,
                    method=request.method,
                    body=body,
                    ip=request.META.get("REMOTE_ADDR")
                )
        except Exception:
            pass
        return response
