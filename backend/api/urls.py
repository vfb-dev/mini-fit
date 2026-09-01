from django.urls import path, include
from . import views

from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register("exercises", views.ExerciseViewset, basename="exercises")
router.register("exercise-sets", views.ExerciseSetViewset, basename="exercise-sets")

urlpatterns = [
    path("", include(router.urls)),
]
