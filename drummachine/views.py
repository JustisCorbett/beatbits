from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.urls import reverse
import requests
import json

from .models import Rack, Kit, Instrument


def index(request):
    """ Render index with all kits to choose from """
    kits = Kit.objects.all()
    return render(request, "drummachine/index.html", {
        "kits": kits
    })


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


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
        
        return JsonResponse({
            "instruments": instruments_list,
            "message": "Success!"
        }, status=200)
    else:
        return JsonResponse({
            "message": "Error: Must use GET!"
        }, status=400)


def load_sound(request, url):
    """ Load sounds on server to avoid CORS blocking and return as HttpResponse"""
    res = requests.get(url)
    return HttpResponse(res)


def save_bit(request):
    """ Save Bit from json as Rack in db """
    if request.method == "POST":
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
            return JsonResponse({
                "message": "Error: You already have a bit with that name!"
            }, status=400)

        return JsonResponse({
            "message": "Save Successful!"
        }, status=200)

        