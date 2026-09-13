from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

import requests

from django.conf import settings

from .models import Job
from .serializers import JobSerializer


# Session authentication without DRF's CSRF check
class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return


@method_decorator(csrf_exempt, name="dispatch")
class JobCreateView(APIView):

    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        jobs = Job.objects.filter(
            user=request.user
        )

        serializer = JobSerializer(
            jobs,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = JobSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                user=request.user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@method_decorator(csrf_exempt, name="dispatch")
class JobDetailView(APIView):

    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):

        try:

            job = Job.objects.get(
                pk=pk,
                user=request.user
            )

        except Job.DoesNotExist:

            return Response(
                {"message": "Job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = JobSerializer(
            job,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        try:

            job = Job.objects.get(
                pk=pk,
                user=request.user
            )

        except Job.DoesNotExist:

            return Response(
                {"message": "Job not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        job.delete()

        return Response(
            {"message": "Job deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


@method_decorator(csrf_exempt, name="dispatch")
class ExternalJobsView(APIView):

    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.GET.get("search", "python")

        app_id = settings.ADZUNA_APP_ID
        app_key = settings.ADZUNA_APP_KEY

        url = "https://api.adzuna.com/v1/api/jobs/in/search/1"

        params = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": 10,
            "what": search,
            "content-type": "application/json",
        }

        try:

            response = requests.get(
                url,
                params=params,
                timeout=10
            )

            response.raise_for_status()

            data = response.json()

            return Response(
                data,
                status=status.HTTP_200_OK
            )

        except requests.exceptions.RequestException as error:

            return Response(
                {
                    "message": "Unable to fetch jobs from Adzuna",
                    "error": str(error)
                },
                status=status.HTTP_502_BAD_GATEWAY
            )