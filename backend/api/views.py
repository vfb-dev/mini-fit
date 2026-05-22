from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Exercise
from .serializers import ExerciseSerializer 
from .pagination import ExercisePagination

from django.db.models import Sum, Max, Avg, F
from django.db.models.functions import TruncDay
from datetime import timedelta
from django.utils import timezone

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

        period_map = {
            "7D": 7,
            "30D": 30,
            "90D": 90,
            "1Y": 365,
        }

        if period in period_map:
            desired_period = now - timedelta(days=period_map[period])
            queryset = queryset.filter(date__gte=desired_period)

        # group by day
        queryset = queryset.annotate(day=TruncDay("date"))

        # metric logic
        if metric == "volume":
            queryset = queryset.annotate(calculated=F("weight") * F("reps")).values("day").annotate(value=Sum("calculated"))
        elif metric == "weight":
            queryset = queryset.values("day").annotate(value=Max("weight"))
        elif metric == "reps":
            queryset = queryset.values("day").annotate(value=Sum("reps"))

        data = [
            {
                "label": item["day"].strftime("%b %d, %Y"),
                "value": item["value"],
            }
            for item in queryset.order_by("day")
        ]

        return Response(data)