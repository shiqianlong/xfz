from django import forms
from apps.forms import FormMixin
from django.core.cache import cache
from .models import User


class LoginForm(forms.Form, FormMixin):
    telephone = forms.CharField(max_length=11, error_messages={'max_length': '请输入正确格式的手机号码'})
    password = forms.CharField(min_length=3, max_length=20,
                               error_messages={'max_length': '密码最多不能超过20字符', 'min_length': '密码最少不能少于3个字符'})
    remember = forms.IntegerField(required=False)


class RegisterForm(forms.Form, FormMixin):
    telephone = forms.CharField(max_length=11, error_messages={'max_length': '请输入正确格式的手机号码'})
    username = forms.CharField(max_length=20)
    password1 = forms.CharField(min_length=3, max_length=20,
                                error_messages={'max_length': '密码最多不能超过20字符', 'min_length': '密码最少不能少于3个字符'})
    password2 = forms.CharField(min_length=3, max_length=20,
                                error_messages={'max_length': '密码最多不能超过20字符', 'min_length': '密码最少不能少于3个字符'})
    # img_captcha = forms.CharField(min_length=4, max_length=4)
    sms_captcha = forms.CharField(min_length=4, max_length=4)

    def clean(self):
        clean_data = super(RegisterForm, self).clean()
        telephone = clean_data.get('telephone')
        password1 = clean_data.get('password1')
        password2 = clean_data.get('password2')
        img_captcha = clean_data.get('img_captcha')
        sms_captcha = clean_data.get('sms_captcha')

        if password1 != password2:
            raise forms.ValidationError('两次输入的密码不一致')
        cached_img_captcha = cache.get(img_captcha.lower())
        if not cached_img_captcha or cached_img_captcha.lower() != img_captcha.lower():
            raise forms.ValidationError('图形验证码错误')
        cached_sms_captcha = cache.get(telephone.lower())
        if not cached_sms_captcha or cached_sms_captcha.lower() != sms_captcha.lower():
            raise forms.ValidationError('短信验证码错误')
        exist = User.objects.filter(telephone=telephone).exists()
        if exist:
            raise forms.ValidationError('该手机号已被注册')

        return clean_data


class SmsCaptcha(forms.Form, FormMixin):
    telephone = forms.CharField(max_length=11, error_messages={'max_length': '请输入正确格式的手机号码！'})

    def clean(self):
        clean_data = super(SmsCaptcha, self).clean()
        telephone = clean_data.get('telephone')
        print(telephone)
        exist = User.objects.filter(telephone=telephone).exists()
        if exist:
            raise forms.ValidationError('该手机号码已被注册！')
        return clean_data