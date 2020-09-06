from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("check_name/<str:name>", views.check_name, name="check_name"),
    path("load_sound/<str:url>", views.load_sound, name="load_sound"),
    path("load_kit/<int:kit>", views.load_kit, name="load_kit"),
    path("save_bit", views.save_bit, name="save_bit"),
    path("new_bit", views.new_bit, name="new_bit"),
    path("user_bits/<str:user>", views.user_bits, name="user_bits")
]