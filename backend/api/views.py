from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Exercise
from .serializers import ExerciseSerializer 
from .pagination import ExercisePagination

# Create your views here.
class ExerciseViewset(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by("-date")
    serializer_class = ExerciseSerializer
    pagination_class = ExercisePagination

    @action(detail=False, methods=["get"])
    def unique_exercises(self, request):
        exercises = (Exercise.objects.values_list("name", flat=True).distinct().order_by("name"))

        return Response(exercises)
