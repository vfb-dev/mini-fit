from django.contrib import admin
from .models import Exercise, ExerciseSet


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ("name", "primary_body_part", "user", "updated_at")
    search_fields = ("name", "user__email", "user__username")
    list_filter = ("primary_body_part",)


@admin.register(ExerciseSet)
class ExerciseSetAdmin(admin.ModelAdmin):
    list_display = ("exercise", "reps", "weight", "date", "user")
    search_fields = ("exercise__name", "user__email", "user__username")
    list_filter = ("date",)
