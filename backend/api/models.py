from django.db import models
from django.utils import timezone

# Create your models here.
class Exercise(models.Model):
    date = models.DateTimeField(default=timezone.now, null=True, blank=True)
    name = models.CharField(max_length=100)
    reps = models.IntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.reps} reps @ {self.weight}kg)"