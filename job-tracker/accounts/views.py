
import logging

from django.contrib.auth import authenticate, login
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer


logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)

            if serializer.is_valid():
                serializer.save()

                return Response(
                    {"message": "User registered successfully"},
                    status=status.HTTP_201_CREATED
                )

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception:
            logger.exception("Registration error")

            return Response(
                {"message": "Registration failed due to a server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")

            if not username or not password:
                return Response(
                    {"message": "Username and password are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(
                request=request._request,
                username=username,
                password=password
            )

            if user is None:
                return Response(
                    {"message": "Invalid username or password"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            login(request._request, user)

            return Response(
                {
                    "message": "Login successful",
                    "username": user.username
                },
                status=status.HTTP_200_OK
            )

        except Exception:
            logger.exception("Login error")

            return Response(
                {"message": "Login failed due to a server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
