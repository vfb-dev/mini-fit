from django.shortcuts import render
from rest_framework import viewsets

from .models import Exercise
from .serializers import ExerciseSerializer 

# Create your views here.
class ExerciseViewset(viewsets.ModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer