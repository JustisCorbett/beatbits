from django.shortcuts import render, HttpResponse
import requests

# Create your views here.
def index(request):
    res = requests.get("https://drive.google.com/uc?export=download&id=1qoQnwu5gurCdi2eTl43cd0QkwBAieG7l")
    return render(request, "drummachine/index.html")


def load_sound(request):
    res = requests.get("https://drive.google.com/uc?export=download&id=1qoQnwu5gurCdi2eTl43cd0QkwBAieG7l")
    #res = requests.get("https://drive.google.com/uc?export=download&id=1H1UKLASmp9GA09GyrGiprG6qaeuaGZ")
    return HttpResponse(res)