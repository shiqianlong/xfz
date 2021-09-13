from django.urls import path
from . import views

app_name = 'course'
urlpatterns = [
    path('', views.course_index, name='course_index'),
    path('<int:course_id>/', views.course_detail, name='course_detail'),
    path('course_token/', views.course_token, name='course_token'),
]
