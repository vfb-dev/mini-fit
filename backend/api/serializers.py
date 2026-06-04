from rest_framework import serializers
from .models import Exercise

from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_decode
from users.tokens import password_reset_token

User = get_user_model()

class ExerciseSerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Exercise
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

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