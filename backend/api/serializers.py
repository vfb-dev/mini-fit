from rest_framework import serializers
from .models import Exercise

from datetime import timedelta
from django.utils import timezone

class ExerciseSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = "__all__"

    def validate_name(self, value):
        return value.strip().lower()
    
    def get_formatted_date(self, obj):
        now = timezone.localtime()
        date = timezone.localtime(obj.date)

        # Same year → 24 May
        if date.year == now.year:
            return date.strftime("%d %b")

        # Different year → 15 Dec 2025
        return date.strftime("%d %b %Y")