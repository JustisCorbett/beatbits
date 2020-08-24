from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("load_sound/<str:url>", views.load_sound, name="load_sound"),
    path("load_kit/<int:kit>", views.load_kit, name="load_kit")
]