# Generated manually for splitting managed exercises from logged sets.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


BODY_PART_CHOICES = [
    ("chest", "Chest"),
    ("back", "Back"),
    ("shoulders", "Shoulders"),
    ("biceps", "Biceps"),
    ("triceps", "Triceps"),
    ("legs", "Legs"),
    ("glutes", "Glutes"),
    ("core", "Core"),
    ("cardio", "Cardio"),
    ("full_body", "Full body"),
    ("other", "Other"),
]


def create_exercises_from_existing_sets(apps, schema_editor):
    Exercise = apps.get_model("api", "Exercise")
    ExerciseSet = apps.get_model("api", "ExerciseSet")

    for exercise_set in ExerciseSet.objects.all().iterator():
        name = (exercise_set.name or "").strip().lower() or "unnamed exercise"

        exercise, _ = Exercise.objects.get_or_create(
            user_id=exercise_set.user_id,
            name=name,
        )

        exercise_set.exercise_id = exercise.id
        exercise_set.save(update_fields=["exercise"])


def restore_set_names(apps, schema_editor):
    ExerciseSet = apps.get_model("api", "ExerciseSet")

    for exercise_set in ExerciseSet.objects.select_related("exercise").all().iterator():
        exercise_set.name = (
            exercise_set.exercise.name
            if exercise_set.exercise_id
            else "unnamed exercise"
        )
        exercise_set.save(update_fields=["name"])


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0005_exercise_user"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Exercise",
            new_name="ExerciseSet",
        ),
        migrations.RunSQL(
            sql=(
                'ALTER INDEX IF EXISTS "api_exercise_user_id_83814c6c" '
                'RENAME TO "api_exerciseset_user_id_idx";'
            ),
            reverse_sql=(
                'ALTER INDEX IF EXISTS "api_exerciseset_user_id_idx" '
                'RENAME TO "api_exercise_user_id_83814c6c";'
            ),
        ),
        migrations.CreateModel(
            name="Exercise",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                (
                    "primary_body_part",
                    models.CharField(
                        blank=True,
                        choices=BODY_PART_CHOICES,
                        max_length=40,
                    ),
                ),
                (
                    "secondary_body_parts",
                    models.JSONField(blank=True, default=list),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="exercise_catalog",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.AddConstraint(
            model_name="exercise",
            constraint=models.UniqueConstraint(
                fields=("user", "name"),
                name="unique_exercise_name_per_user",
            ),
        ),
        migrations.AddField(
            model_name="exerciseset",
            name="exercise",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="sets",
                to="api.exercise",
            ),
        ),
        migrations.RunPython(
            create_exercises_from_existing_sets,
            restore_set_names,
        ),
        migrations.RemoveField(
            model_name="exerciseset",
            name="name",
        ),
        migrations.AlterField(
            model_name="exerciseset",
            name="exercise",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="sets",
                to="api.exercise",
            ),
        ),
        migrations.AlterField(
            model_name="exerciseset",
            name="reps",
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name="exerciseset",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="exercise_sets",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterModelOptions(
            name="exerciseset",
            options={"ordering": ["-date"]},
        ),
    ]
