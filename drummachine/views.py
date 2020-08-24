from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import requests
import json

from .models import Rack, Kit, Instrument


def index(request):
    """ Render index with all kits to choose from """
    kits = Kit.objects.all()
    return render(request, "drummachine/index.html", {
        "kits": kits
    })


def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
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