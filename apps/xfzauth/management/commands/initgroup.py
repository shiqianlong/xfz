from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission, ContentType
from apps.news.models import News, NewsCategory, Banner, Comment
from apps.course.models import Course, CourseCategory, Teacher



class Command(BaseCommand):
    def handle(self, *args, **options):

        # newsGroup = Group.objects.get(name='视频')
        # newsGroup.delete()


        # 文章组（文章，轮播图，评论）
        news_content_types = [
            ContentType.objects.get_for_model(News),
            ContentType.objects.get_for_model(NewsCategory),
            ContentType.objects.get_for_model(Banner),
            ContentType.objects.get_for_model(Comment),
        ]
        # 找到其下的所有权限
        news_permissions = Permission.objects.filter(content_type__in=news_content_types)
        # 分组
        newsGroup = Group.objects.create(name='文章组')
        # 将权限添加进分组中
        newsGroup.permissions.set(news_permissions)
        newsGroup.save()
        self.stdout.write(self.style.SUCCESS('文章组创建成功'))

        # 视频组（视频）
        course_content_types = [
            ContentType.objects.get_for_model(Course),
            ContentType.objects.get_for_model(CourseCategory),
            ContentType.objects.get_for_model(Teacher),
        ]
        course_permissions = Permission.objects.filter(content_type__in=course_content_types)
        courseGroup = Group.objects.create(name='视频组')
        courseGroup.permissions.set(course_permissions)
        courseGroup.save()
        self.stdout.write(self.style.SUCCESS('视频组创建成功'))

        # 管理员组（文章+视频）
        admin_permissions = news_permissions.union(course_permissions)
        adminGroup = Group.objects.create(name='管理员')
        adminGroup.permissions.set(admin_permissions)
        adminGroup.save()
        self.stdout.write(self.style.SUCCESS('管理员组创建成功'))
        # 超级管理员