from rest_framework import serializers
from .models import News, NewsCategory, Comment,Banner
from apps.xfzauth.serializers import UserSerializers


class NewsCategorySerializers(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ['id', 'name']


class NewsSerializers(serializers.ModelSerializer):
    category = NewsCategorySerializers()
    author = UserSerializers()

    class Meta:
        model = News
        fields = ['id', 'title', 'desc', 'thumbnail', 'pub_time', 'author', 'category']


class CommentSerializers(serializers.ModelSerializer):
    user = UserSerializers()
    class Meta:
        model = Comment
        fields = ['content','pub_time','user']


class BannerSerializers(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['priority','thumbnail','link_to','id']