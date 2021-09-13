from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from shortuuidfield import ShortUUIDField
from django.db import models


class UserManage(BaseUserManager):
    def _create_user(self, telephone, username, password, **kwargs):
        if not telephone:
            raise ValueError('请传入手机号码')
        if not username:
            raise ValueError('请传入用户名')
        if not password:
            raise ValueError('请传入密码')

        user = self.model(telephone=telephone, username=username, **kwargs)
        # 对密码进行加密
        user.set_password(password)
        user.save()
        return user

    def create_user(self, telephone, username, password, **kwargs):
        kwargs['is_superuser'] = False
        return self._create_user(telephone, username, password, **kwargs)

    def create_superuser(self, telephone, username, password, **kwargs):
        kwargs['is_superuser'] = True
        kwargs['is_staff'] = True
        return self._create_user(telephone, username, password, **kwargs)


class User(AbstractBaseUser, PermissionsMixin):
    # 不使用默认的自增长的主键
    # uuid/shortuuid
    # shortuuidfield：pip install django-shortuuidfield
    uid = ShortUUIDField(primary_key=True)
    telephone = models.CharField(max_length=11, unique=True)
    password = models.CharField(max_length=200)
    # unique唯一的
    email = models.EmailField(null=True, blank=True)
    username = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    # 是否是员工
    is_staff = models.BooleanField(default=False)
    data_joined = models.DateTimeField(auto_now_add=True)

    # 作为验证的字段，如果没有重写user模型，默认的时username
    USERNAME_FIELD = 'telephone'
    # 在调用create supperuser要填的字段，telephone，username，password
    REQUIRED_FIELDS = ['username']
    EMAIL_FIELD = 'email'

    objects = UserManage()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username