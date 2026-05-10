from django.db import models

# Create your models here.
class Exercise(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    reps = models.IntegerField()
    weight = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.name} ({self.reps} reps @ {self.weight}kg)"