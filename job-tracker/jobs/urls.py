from django.urls import path

from .views import (
    JobCreateView,
    JobDetailView,
    ExternalJobsView,
)


urlpatterns = [
    path("", JobCreateView.as_view(), name="job-list-create"),

    path(
        "<int:pk>/",
        JobDetailView.as_view(),
        name="job-detail",
    ),

    path(
        "external/",
        ExternalJobsView.as_view(),
        name="external-jobs",
    ),
]