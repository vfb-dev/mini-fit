from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Exercise
from .serializers import ExerciseSerializer 
from .pagination import ExercisePagination

from django.db.models import Sum, Max, Avg, F
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from datetime import timedelta
from django.utils import timezone

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status

# Create your views here.
class ExerciseViewset(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by("-date")
    serializer_class = ExerciseSerializer
    pagination_class = ExercisePagination

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
                secure=False,  # True in production
                samesite="Lax",
            )

            res.set_cookie(
                key="refresh_token",
                value=refresh,
                httponly=True,
                secure=False,  # True in production
                samesite="Lax",
            )

            return res

        return response

