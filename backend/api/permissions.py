from rest_framework.permissions import BasePermission
from .models import User


class IsAdminStaff(BasePermission):
    """
    Grants access only to users with role=ADMIN.
    DRF equivalent of Assignment 1's @admin_required decorator.
    """
    message = "You must be an administrator to perform this action."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Roles.ADMIN
        )
