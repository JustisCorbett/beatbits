from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import requests

# Create your views here.
def index(request):
    kits = Kit.objects.all()
    return render(request, "drummachine/index.html", {
        "kits": kits
    })

def load_kit(request):
    """ Query db for instruments belonging in provided kit and return json of values"""
    if request.method == "GET":
        data = json.loads(request.body)
        kit_id = data.get("id")
        # wrap query values in list for json
        instruments = list(Instrument.objects.filter(kit = kit_id).values())
        
    return JsonResponse({
        "instruments": instruments,
        "message": message
    }, status=400)


def load_sound(request, url):
    """ Load sounds on server to avoid CORS blocking and return as HttpResponse"""
    res = requests.get("https://drive.google.com/uc?export=download&id=1qoQnwu5gurCdi2eTl43cd0QkwBAieG7l")
    #res = requests.get("https://drive.google.com/uc?export=download&id=1H1UKLASmp9GA09GyrGiprG6qaeuaGZ")
    return HttpResponse(res)