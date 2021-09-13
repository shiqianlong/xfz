from django.db import models


class NewsCategory(models.Model):
    name = models.CharField(max_length=100)


class News(models.Model):
    title = models.CharField(max_length=200)
    desc = models.CharField(max_length=200)
    thumbnail = models.URLField(null=True, blank=True, default='http://cdn.shiqianlong.top/ziwu.png')
    content = models.TextField()
    category = models.ForeignKey('NewsCategory', on_delete=models.SET_NULL, null=True)
    pub_time = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('xfzauth.User', on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-pub_time']


class Comment(models.Model):
    user = models.ForeignKey('xfzauth.User',on_delete=models.CASCADE)
    content = models.TextField()
    news = models.ForeignKey('News',on_delete=models.CASCADE,related_name='comments')
    pub_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pub_time']


class Banner(models.Model):
    priority = models.IntegerField()
    thumbnail = models.URLField()
    link_to = models.URLField()
    pub_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['priority']