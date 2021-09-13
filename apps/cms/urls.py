from django.urls import path
from . import views, course_views, staff_views

app_name = 'cms'
urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('', views.index, name='index'),
    path('write_news/', views.WriteNewsView.as_view(), name='write_news'),
    path('news_category/', views.news_category, name='news_category'),
    path('add_news_category/', views.add_news_category, name='add_news_category'),
    path('edit_news_category/', views.edit_news_category, name='edit_news_category'),
    path('delete_news_category/', views.delete_news_category, name='delete_news_category'),
    path('upload_file/', views.upload_file, name='upload_file'),
    path('qntoken/', views.qntoken, name='qntoken'),
    path('banners/', views.banners, name='banners'),
    path('news_list/', views.NewsListView.as_view(), name='news_list'),
    path('edit_news/', views.EditNewsView.as_view(), name='edit_news'),
    path('delete_news/', views.delete_news, name='delete_news'),
]

# 课程管理
urlpatterns += [
    path('pub_course/', course_views.PubCourseView.as_view(), name='pub_course'),
]

# 权限管理
urlpatterns += [
    path('staff/', staff_views.index, name='staff_index'),
    path('add_staff/', staff_views.AddStaffView.as_view(), name='add_staff'),
]
