from django.db import models


# 课程分类
class CourseCategory(models.Model):
    name = models.CharField(max_length=100)


# 课程讲师
class Teacher(models.Model):
    # 姓名
    username = models.CharField(max_length=100)
    # 头像
    avatar = models.URLField()
    # 职务
    jobtitle = models.CharField(max_length=100)
    # 简介
    profile = models.TextField()



class Course(models.Model):
    title = models.CharField(max_length=200)
    category = models.ForeignKey('CourseCategory',on_delete=models.DO_NOTHING)
    teacher = models.ForeignKey('Teacher',on_delete=models.DO_NOTHING)
    # 视频链接
    video_url = models.URLField()
    # 封面图链接
    cover_url = models.URLField()
    price = models.FloatField()
    # 时长
    duration = models.IntegerField()
    # 简介
    profile = models.TextField()
    pub_time = models.DateTimeField(auto_now_add=True)