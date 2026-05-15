from django.shortcuts import render
from rest_framework import viewsets

from .models import Exercise
from .serializers import ExerciseSerializer 
from .pagination import ExercisePagination

# Create your views here.
class ExerciseViewset(viewsets.ModelViewSet):
    queryset = Exercise.objects.all().order_by("-date")
    serializer_class = ExerciseSerializer
    pagination_class = ExercisePagination