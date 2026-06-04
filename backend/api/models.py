from django.db import models
from django.utils import timezone
from django.conf import settings

# Create your models here.
class Exercise(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exercises",
    )

    date = models.DateTimeField()
    name = models.CharField(max_length=100)
    reps = models.IntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.reps} reps @ {self.weight}kg)"