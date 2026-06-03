from django.contrib import admin
from django.urls import path, include

from api.views import (
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RefreshView,
    RegisterView,
    VerifyEmailView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Endpoints
    path("api/v1/", include("api.urls")),

    # JWT
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("refresh/", RefreshView.as_view()),
    path("verify-email/<uidb64>/<token>/", VerifyEmailView.as_view()),
    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),
]
