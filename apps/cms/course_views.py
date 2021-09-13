from django.shortcuts import render
from apps.course.models import CourseCategory,Course,Teacher
from django.views import View
from apps.cms.forms import PubCourseForm
from utils import restful
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import permission_required



@method_decorator(permission_required(perm="course.change_course", login_url='/'), name='dispatch')
class PubCourseView(View):
    def get(self, request):
        categories = CourseCategory.objects.all()
        teachers = Teacher.objects.all()
        context = {
            'categories': categories,
            'teachers':teachers
        }
        return render(request, 'cms/pub_course.html', context=context)

    def post(self,request):
        form = PubCourseForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            catagory_id = form.cleaned_data.get('category_id')
            teacher_id = form.cleaned_data.get('teacher_id')
            video_url = form.cleaned_data.get('video_url')
            cover_url = form.cleaned_data.get('cover_url')
            price = form.cleaned_data.get('price')
            duration = form.cleaned_data.get('duration')
            profile = form.cleaned_data.get('profile')

            category = CourseCategory.objects.get(pk=catagory_id)
            teacher = Teacher.objects.get(pk=teacher_id)
            Course.objects.create(title=title,category=category,teacher=teacher,video_url=video_url,cover_url=cover_url,price=price,duration=duration,profile=profile)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())