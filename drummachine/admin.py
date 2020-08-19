from django.contrib import admin

from .models import Rack, Instrument
# Register your models here.
admin.site.register(Rack)
admin.site.register(Instrument)