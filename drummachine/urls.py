from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("load_sound/<str:url>", views.load_sound, name="load_sound"),
    path("load_kit/<int:kit>", views.load_kit, name="load_kit")
]