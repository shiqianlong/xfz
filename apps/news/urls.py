from django.urls import path
from . import views

app_name = 'news'
urlpatterns = [
    path('<int:news_id>/', views.news_detail, name='news_detail'),
    path('search/', views.search, name='search'),
    path('list/', views.news_list, name='news_list'),
    path('pub_comment/', views.pub_comment, name='pub_comment'),
    path('add_banner/', views.add_banner, name='add_banner'),
    path('banner_list/', views.banner_list, name='banner_list'),
    path('delete_banner/', views.delete_banner, name='delete_banner'),
    path('edit_banner/', views.edit_banner, name='edit_banner'),
]
