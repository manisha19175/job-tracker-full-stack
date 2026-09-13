from django.db import models
from django.contrib.auth.models import User


class Job(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    company = models.CharField(max_length=100)
    job_title = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    job_url = models.URLField()
    status = models.CharField(max_length=50, default="Applied")
    applied_date = models.DateField()

    def __str__(self):
        return self.job_title