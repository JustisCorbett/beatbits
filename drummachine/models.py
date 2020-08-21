import os
from django.contrib.auth.models import User
from django.conf import settings
from django.db import models

def sounds_path():
    return os.path.join(settings.STATIC_URL, 'drummachine/sounds/')


class Rack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="racks")
    name = models.CharField(max_length=25, default="untitled")
    config = models.JSONField()

    def __str__(self):
        return "%s's Rack %s" % (self.user, self.name)


class Kit(models.Model):
    name = models.CharField(max_length=25)

    def __str__(self):
        return "%s" % (self.name)


class Instrument(models.Model):
    name = models.CharField(max_length=25)
    kit = models.ForeignKey(Kit, on_delete=models.CASCADE, related_name="instruments")
    path = models.FilePathField(path=sounds_path())

    def __str__(self):
        return "%s" % (self.name)
    