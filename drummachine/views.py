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

        instruments = Instrument.objects.filter(kit=kit_id)
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
    res = requests.get("https://drive.google.com/uc?export=download&id=1qoQnwu5gurCdi2eTl43cd0QkwBAieG7l")
    #res = requests.get("https://drive.google.com/uc?export=download&id=1H1UKLASmp9GA09GyrGiprG6qaeuaGZ")
    return HttpResponse(res)