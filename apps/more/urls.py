from django.urls import path
from . import views

app_name = 'more'
urlpatterns = [
    path('more_index/',views.more_index,name='more_index'),
]
