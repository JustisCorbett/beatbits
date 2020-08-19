import os
from django.contrib.auth.models import User
from django.conf import settings
from django.db import models


def sounds_path():
    return os.path.join(settings.STATIC_URL, 'sounds')


class Rack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="racks")
    instruments = models.JSONField()


class Instrument(models.Model):
    name = models.CharField(max_length=25)
    path = models.FilePathField(path=sounds_path, allow_files=True)
    