from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("load_sound", views.load_sound, name="load_sound")
]