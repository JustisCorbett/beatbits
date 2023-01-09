from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.urls import reverse
from django.templatetags.static import static
import requests
import json

from .models import User, Rack, Kit, Instrument


def index(request):
    """ Render index with all bits to choose from """
    bits = Rack.objects.all()
    return render(request, "drummachine/index.html", {
        "bits": bits
    })


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "drummachine/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "drummachine/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "drummachine/register.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        # Attempt to log user in
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "drummachine/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "drummachine/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def check_name(request, name):
    try:
        res = User.objects.get(username=name)
        return HttpResponse("Username Taken", status=200);
    except User.DoesNotExist:
        return HttpResponse("Username Free", status=404);


def load_kit(request, kit):
    """ Query db for instruments belonging in provided kit and return json of values"""
    if request.method == "GET":

        instruments = Instrument.objects.filter(kit=kit)
        if not instruments:
            return JsonResponse({
                "message": "Error: Kit does not exist!"
            }, status=404)
        # wrap query values in list for json
        instruments_list = list(instruments.values())

        # change path for each instrument to full static path
        for instrument in instruments_list:
            path_part = instrument["path"]
            path_full = static(path_part)
            instrument["path"] = path_full
        return JsonResponse({
            "instruments": instruments_list,
            "message": "Success!"
        }, status=200)
    else:
        return HttpResponse("Kit not found", status=404)


def user_bits(request):
    """ Render page with all of a user's bits """
    username = request.GET["user"]

    user = User.objects.get(username=username)
    bits = Rack.objects.filter(user=user)
    return render(request, "drummachine/userbits.html", {
        "user": user,
        "bits": bits
    })


def load_machine(request):
    """ Render new bit maker with all kits to choose from """
    kits = Kit.objects.all()
    
    return render(request, "drummachine/loadmachine.html", {
        "kits": kits
    })


def load_bit_info(request):
    """ Return config of specified rack """
    username = request.GET["user"]
    rack_name = request.GET["rack"]

    user = User.objects.get(username=username)
    rack = Rack.objects.get(user=user, name=rack_name)
    if rack:
        return JsonResponse(rack, status=200)
    else:
        return HttpResponse("Rack not found!", satus=404)


def save_bit(request):
    """ Save Bit from json as Rack in db """
    if request.method == "POST":
        if not request.user.is_authenticated:
            return HttpResponse("User not authenticated", status=401);

        user = request.user
        data = json.loads(request.body)
        name = data["name"]


        rack = Rack(
            user=user,
            name=name,
            config=data
        )
        try:
            rack.save()
        except IntegrityError:
            return HttpResponse("You already have a bit with that name!", status=400)
        return HttpResponse("Save successful!", status=200)

def delete_bit(request):
    """ Delete Bit as Rack in db """
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return HttpResponse("User not authenticated", status=401);
        
        user = request.user
        data = json.loads(request.body)
        name = data["name"]

        rack = get_object_or_404(Rack, user=user, name=name)

        try:
            rack.delete()
        except:
            return HttpResponse("Deletion failed.", status=400)
        return HttpResponse("Deletion successful!", status=200)