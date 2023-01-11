from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("check_name/<str:name>", views.check_name, name="check_name"),
    path("load_kit/<int:kit>", views.load_kit, name="load_kit"),
    path("save_bit", views.save_bit, name="save_bit"),
    path("delete_bit", views.delete_bit, name="delete_bit"),
    path("load_machine", views.load_machine, name="load_machine"),
    path("load_bit_info", views.load_bit_info, name="load_bit_info"),
    path("user_bits", views.user_bits, name="user_bits")
]