from datetime import date

from django.test import SimpleTestCase

from .views import calculate_workout_streaks


class WorkoutStreakTests(SimpleTestCase):
    def test_streak_stays_active_before_four_rest_days(self):
        workout_days = [
            date(2026, 8, 24),
            date(2026, 8, 28),
        ]

        streak, max_streak = calculate_workout_streaks(
            workout_days,
            date(2026, 8, 31),
        )

        self.assertEqual(streak, 2)
        self.assertEqual(max_streak, 2)

    def test_streak_resets_after_four_rest_days(self):
        workout_days = [
            date(2026, 8, 24),
            date(2026, 8, 28),
        ]

        streak, max_streak = calculate_workout_streaks(
            workout_days,
            date(2026, 9, 1),
        )

        self.assertEqual(streak, 0)
        self.assertEqual(max_streak, 2)
