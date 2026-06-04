from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Exercise
from .serializers import (
    ExerciseSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
)
from .pagination import ExercisePagination

from django.db.models import Sum, Max, Avg, F
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from datetime import timedelta
from django.utils import timezone

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated

from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from users.tokens import email_verification_token, password_reset_token
from django.contrib.auth import get_user_model

User = get_user_model()

def send_verification_email(user, verification_url):
    app_name = settings.APP_NAME

    subject = f"Confirm your {app_name} email"

    text_body = (
        f"Hi {user.username},\n\n"
        f"Welcome to {app_name}. Please confirm this email address so you can sign in:\n\n"
        f"{verification_url}\n\n"
        "If you did not create this account, you can safely ignore this email.\n\n"
        f"Thanks,\nThe {app_name} team"
    )

    html_body = f"""
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,sans-serif;color:#18181b;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#18181b;">
          Confirm your email
        </h1>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
          Hi {user.username},
        </p>

        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
          Welcome to {app_name}. Please confirm this email address so you can sign in.
        </p>

        <p style="margin:0 0 24px;">
          <a href="{verification_url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;font-size:15px;font-weight:600;">
            Confirm email
          </a>
        </p>

        <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#52525b;">
          If the button does not work, paste this link into your browser:
        </p>

        <p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all;color:#52525b;">
          {verification_url}
        </p>

        <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=[settings.SUPPORT_EMAIL],
        headers={
            "Auto-Submitted": "auto-generated",
            "X-Auto-Response-Suppress": "All",
        },
    )

    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)

def send_password_reset_email(user, reset_url):
    app_name = settings.APP_NAME
    subject = f"Reset your {app_name} password"

    text_body = (
        f"Hi {user.username},\n\n"
        f"Use this link to reset your password:\n\n"
        f"{reset_url}\n\n"
        "If you did not request this, you can safely ignore this email.\n\n"
        f"Thanks,\nThe {app_name} team"
    )

    html_body = f"""
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,sans-serif;color:#18181b;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:28px;">
        <h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi {user.username},</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
          Click the button below to create a new password.
        </p>
        <p style="margin:0 0 24px;">
          <a href="{reset_url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;font-size:15px;font-weight:600;">
            Reset password
          </a>
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#52525b;">
          If the button does not work, paste this link into your browser:
        </p>
        <p style="margin:0 0 24px;font-size:13px;word-break:break-all;color:#52525b;">
          {reset_url}
        </p>
        <p style="margin:0;font-size:13px;color:#71717a;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>
"""

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
        reply_to=[settings.SUPPORT_EMAIL],
        headers={
            "Auto-Submitted": "auto-generated",
            "X-Auto-Response-Suppress": "All",
        },
    )

    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)

class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = password_reset_token.make_token(user)

            frontend_url = settings.FRONTEND_URL.rstrip("/")
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}"

            send_password_reset_email(user, reset_url)

        return Response(
            {"detail": "If an account exists for that email, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )

class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Password reset successfully."},
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExerciseViewset(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by("-date")
    serializer_class = ExerciseSerializer
    pagination_class = ExercisePagination
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def unique_exercises(self, request):
        exercises = (Exercise.objects.values_list("name", flat=True).distinct().order_by("name"))

        return Response(exercises)
    
    @action(detail=False, methods=["get"])
    def chart(self, request):
        exercise = request.query_params.get("exercise")
        metric = request.query_params.get("metric", "volume")
        period  = request.query_params.get("period", "30D")

        queryset = Exercise.objects.all()

        # filter exercise
        if exercise:
            queryset = queryset.filter(name=exercise)

        # filter period
        now = timezone.now()

        period_map = { "7D": 7, "30D": 30, "90D": 90, "1Y": 365,}
        
        if period in period_map:
            desired_period = now - timedelta(days=period_map[period])
            queryset = queryset.filter(date__gte=desired_period)

        # group by day
        if period in ["7D", "30D", "90D"]:
            queryset = queryset.annotate(group_date=TruncDay("date"))
        elif period == "1Y":
            queryset = queryset.annotate(group_date=TruncMonth("date"))
        else:
            queryset = queryset.annotate(group_date=TruncYear("date"))

        # metric logic
        if metric == "volume":
            queryset = queryset.annotate(calculated=F("weight") * F("reps")).values("group_date").annotate(value=Sum("calculated"))
        elif metric == "weight":
            queryset = queryset.values("group_date").annotate(value=Max("weight"))
        elif metric == "reps":
            queryset = queryset.values("group_date").annotate(value=Sum("reps"))

        short_label_format = ""
        if period in ["7D", "30D", "90D"]:
            short_label_format = "%b %d"
        elif period == "1Y":
            short_label_format = "%b"
        else:
            short_label_format = "%Y"

        data = [
            {
                "label": item["group_date"].strftime(short_label_format),
                "tooltip_label": item["group_date"].strftime("%b %d, %Y"),
                "value": item["value"],
            }
            for item in queryset.order_by("group_date")
        ]

        return Response(data)
    
    @action(detail=False, methods=["get"])
    def stats_cards(self, request):
        queryset = Exercise.objects.all()

        # 🔥 Streak
        workout_days = list(
            queryset
            .values_list("date__date", flat=True)
            .distinct()
            .order_by("-date__date")
        )

        streak = 0

        if workout_days:
            streak = 1

        for i in range(len(workout_days) - 1):
            current_day = workout_days[i]
            next_day = workout_days[i + 1]

            difference = current_day - next_day

            if difference <= timedelta(days=2):
                streak += 1
            else:
                break

        # 📦 Weekly Volume Progress
        weekly_volume = (
            queryset
            .annotate(group_date=TruncWeek("date"))
            .annotate(volume=F("weight") * F("reps"))
            .values("group_date")
            .annotate(total_volume=Sum("volume"))
            .order_by("group_date")
        )

        weekly_volume = list(weekly_volume)

        volume_progressions = []

        for i in range(1, len(weekly_volume)):
            current = weekly_volume[i]["total_volume"] or 0
            previous = weekly_volume[i - 1]["total_volume"] or 0

            if previous > 0:
                progress = ((current - previous) / previous) * 100
                volume_progressions.append(progress)

        avg_weekly_volume_progress = (
            sum(volume_progressions) / len(volume_progressions)
            if volume_progressions
            else 0
        )

        # 🔁 Weekly Reps Progress
        weekly_reps = (
            queryset
            .annotate(group_date=TruncWeek("date"))
            .values("group_date")
            .annotate(total_reps=Sum("reps"))
            .order_by("group_date")
        )

        weekly_reps = list(weekly_reps)

        reps_progressions = []

        for i in range(1, len(weekly_reps)):
            current = weekly_reps[i]["total_reps"] or 0
            previous = weekly_reps[i - 1]["total_reps"] or 0

            if previous > 0:
                progress = ((current - previous) / previous) * 100
                reps_progressions.append(progress)

        avg_weekly_reps_progress = (
            sum(reps_progressions) / len(reps_progressions)
            if reps_progressions
            else 0
        )

        # 🏋️ Weekly Weight Progress
        weekly_weight = (
            queryset
            .annotate(group_date=TruncWeek("date"))
            .values("group_date")
            .annotate(avg_weight=Avg("weight"))
            .order_by("group_date")
        )

        weekly_weight = list(weekly_weight)

        weight_progressions = []

        for i in range(1, len(weekly_weight)):
            current = weekly_weight[i]["avg_weight"] or 0
            previous = weekly_weight[i - 1]["avg_weight"] or 0

            if previous > 0:
                progress = ((current - previous) / previous) * 100
                weight_progressions.append(progress)

        avg_weekly_weight_progress = (
            sum(weight_progressions) / len(weight_progressions)
            if weight_progressions
            else 0
        )

        data = {
            "streak": streak,
            "avg_weekly_volume_progress": round(avg_weekly_volume_progress, 1),
            "avg_weekly_reps_progress": round(avg_weekly_reps_progress, 1),
            "avg_weekly_weight_progress": round(avg_weekly_weight_progress, 1),
        }

        return Response(data)

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access = response.data["access"]
            refresh = response.data["refresh"]

            res = Response(
                {"success": True},
                status=status.HTTP_200_OK
            )

            res.set_cookie(
                key="access_token",
                value=access,
                httponly=True,
                secure=True,  # True in production
                samesite="Lax",
                max_age=60 * 30,  # 30 minutes
            )

            res.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=True,  # True in production
                samesite="Lax",
                max_age=60 * 60 * 24 * 7,  # 7 days
            )

            return res

        return response
    
class LogoutView(APIView):

    def post(self, request):
        response = Response(
            {"success": True},
            status=status.HTTP_200_OK
        )

        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "is_verified": request.user.is_verified,
            "date_joined": request.user.date_joined,
        })

class RefreshView(APIView):

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)

            response = Response(
                {"detail": "Token refreshed successfully."},
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=True,
                samesite="Lax",
                max_age=60 * 30,  # 30 minutes
            )

            return response

        except Exception:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

class RegisterView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            uid = urlsafe_base64_encode(
                force_bytes(user.pk)
            )

            token = email_verification_token.make_token(user)

            frontend_url = settings.FRONTEND_URL.rstrip("/")

            verification_url = (
                f"{frontend_url}/verify-email/"
                f"{uid}/{token}"
            )

            send_verification_email(user, verification_url)

            return Response(
                {
                    "detail": "Account created. Check your email."
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
    
class VerifyEmailView(APIView):
    permission_classes = []

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

        except Exception:
            return Response(
                {"detail": "Invalid link"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email_verification_token.check_token(user, token):
            user.is_verified = True
            user.save()

            return Response(
                {"detail": "Email verified"},
                status=status.HTTP_200_OK,
            )

        return Response(
            {"detail": "Invalid token"},
            status=status.HTTP_400_BAD_REQUEST,
        )