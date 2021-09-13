from django.contrib.auth import login, logout, authenticate
from .forms import LoginForm, RegisterForm, SmsCaptcha
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from utils import restful
from django.shortcuts import redirect, reverse
from utils.captcha.xfzcaptcha import Captcha
from io import BytesIO
from django.http import HttpResponse
from utils.aliyunsdk import aliyunsms
from utils.restful import result
from django.core.cache import cache
from .models import User


# 设置与前端交流的数据
# {"code":200,"message":"","data":{}}
@require_POST
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        user = authenticate(request, telephone=telephone, password=password)
        if user:
            if user.is_active:
                login(request, user)
                if remember:
                    request.session.set_expiry(None)
                else:
                    request.session.set_expiry(0)
                return restful.ok()
            else:
                return restful.unauth(message='您的账号被冻结')
        else:
            return restful.params_error(message='账号或密码错误')
    else:
        # 表单验证失败的数据
        errors = form.get_errors()
        return restful.params_error(message=errors)


def logout_view(request):
    logout(request)
    # 重定向到index页面
    return redirect(reverse('index'))


def img_captcha(request):
    text, image = Captcha.gene_code()
    # bytesIo相当于一个管道，用来存储图片的流数据
    out = BytesIO()
    image.save(out, 'png')
    # 将文件指针移动到最开始的位置
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    response.write(out.read())
    # 写入数据的长度
    response['Content-length'] = out.tell()
    cache.set(text.lower(), text.lower(), 5 * 60)

    return response


def sms_captcha(request):
    form = SmsCaptcha(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        code = Captcha.gene_text_sms()
        cache.set(telephone, code, 5 * 60)
        # aliyunsms.send_sms(telephone,code)

        print('-' * 30)
        print('短信验证码：' + code)
        print('-' * 30)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())


def cache_test(request):
    # 使用memcached是要下载包pip install python-memcached
    cache.set('username', 'ziwu', 60)
    result = cache.get('username')
    print(result)
    return HttpResponse('success')


@require_POST
def register(request):
    form = RegisterForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password1')
        username = form.cleaned_data.get('username')
        user = User.objects.create_user(telephone=telephone, password=password, username=username)
        login(request, user)
        return restful.ok()
    else:
        return restful.params_error(message=form.get_errors())
