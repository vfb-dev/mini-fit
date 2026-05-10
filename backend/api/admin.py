from django.contrib import admin
from .models import Exercise

# Register your models here.
@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'reps', 'weight', 'date')