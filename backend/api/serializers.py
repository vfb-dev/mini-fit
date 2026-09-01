from rest_framework import serializers
from .models import BodyPart, Exercise, ExerciseSet

from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_decode
from users.tokens import password_reset_token

User = get_user_model()

VALID_BODY_PARTS = {value for value, _ in BodyPart.choices}


class ExerciseSerializer(serializers.ModelSerializer):
    set_count = serializers.IntegerField(read_only=True)
    last_logged_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Exercise
        fields = [
            "id",
            "name",
            "primary_body_part",
            "secondary_body_parts",
            "set_count",
            "last_logged_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_name(self, value):
        name = value.strip().lower()

        if not name:
            raise serializers.ValidationError("Exercise name is required.")

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            queryset = Exercise.objects.filter(user=request.user, name=name)

            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError("Exercise already exists.")

        return name

    def validate_secondary_body_parts(self, value):
        if value in (None, ""):
            return []

        if not isinstance(value, list):
            raise serializers.ValidationError("Secondary body parts must be a list.")

        body_parts = []
        for item in value:
            if not isinstance(item, str):
                raise serializers.ValidationError("Body parts must be text values.")

            body_part = item.strip().lower()

            if body_part not in VALID_BODY_PARTS:
                raise serializers.ValidationError(f"Invalid body part: {item}")

            if body_part not in body_parts:
                body_parts.append(body_part)

        return body_parts

    def validate(self, attrs):
        primary_body_part = attrs.get(
            "primary_body_part",
            self.instance.primary_body_part if self.instance else "",
        )
        secondary_body_parts = attrs.get(
            "secondary_body_parts",
            self.instance.secondary_body_parts if self.instance else [],
        )

        if primary_body_part:
            secondary_body_parts = [
                body_part
                for body_part in secondary_body_parts
                if body_part != primary_body_part
            ]

        attrs["secondary_body_parts"] = secondary_body_parts
        return attrs


class ExerciseSetSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()
    name = serializers.CharField(source="exercise.name", read_only=True)

    class Meta:
        model = ExerciseSet
        fields = [
            "id",
            "exercise",
            "name",
            "date",
            "formatted_date",
            "reps",
            "weight",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["user", "created_at", "updated_at"]

    def validate_exercise(self, value):
        request = self.context.get("request")

        if request and value.user_id != request.user.id:
            raise serializers.ValidationError("Exercise not found.")

        return value

    def get_formatted_date(self, obj):
        now = timezone.localtime()
        date = timezone.localtime(obj.date)

        # Same year → 24 May
        if date.year == now.year:
            return date.strftime("%d %b")

        # Different year → 15 Dec 2025
        return date.strftime("%d %b %Y")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
        )
    
class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_verified:
            raise serializers.ValidationError(
                "Please verify your email first."
            )

        return data
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        try:
            uid = urlsafe_base64_decode(attrs["uid"]).decode()
            user = User.objects.get(pk=uid)
        except Exception:
            raise serializers.ValidationError({
                "detail": "Invalid reset link."
            })

        if not password_reset_token.check_token(user, attrs["token"]):
            raise serializers.ValidationError({
                "detail": "Invalid or expired reset link."
            })

        validate_password(attrs["password"], user=user)

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["password"])
        user.save()
        return user
