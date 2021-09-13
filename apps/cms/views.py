from django.shortcuts import render
# 验证是否是员工，如果不是则定位到其他页面
from django.contrib.admin.views.decorators import staff_member_required
from django.views import View
from django.views.decorators.http import require_POST, require_GET
from apps.news.models import NewsCategory, News
from utils import restful
from .forms import EditNewsCategoryForm, WriteNewsForm, EditNewsForm
import os
from django.conf import settings
import qiniu
from django.core.paginator import Paginator
from datetime import datetime
from django.utils.timezone import make_aware
from urllib import parse
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import permission_required


def login_view(request):
    return render(request, 'cms/login.html')


# 员工验证器
@staff_member_required(login_url='index')
def index(request):
    return render(request, 'cms/index.html')


@method_decorator(permission_required(perm="news.add_news", login_url='/'), name='dispatch')
class WriteNewsView(View):
    def get(self, request):
        categories = NewsCategory.objects.all()

        context = {
            'categories': categories
        }
        return render(request, 'cms/write.html', context=context)

    def post(self, request):
        form = WriteNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            content = form.cleaned_data.get('content')
            thumbnail = form.cleaned_data.get('thumbnail')
            category_id = form.cleaned_data.get('category')
            category = NewsCategory.objects.get(pk=category_id)
            News.objects.create(title=title, desc=desc, content=content, thumbnail=thumbnail, category=category,
                                author=request.user)
            return restful.ok()
        else:
            return restful.params_error(message=form.get_errors())


@require_GET
@permission_required(perm="news.add_newscategory",login_url='/')
def news_category(request):
    categories = NewsCategory.objects.all()
    context = {
        'categories': categories
    }
    return render(request, 'cms/news_category.html', context=context)


@require_POST
@permission_required(perm="news.add_newscategory",login_url='/')
def add_news_category(request):
    name = request.POST.get('name')
    exist = NewsCategory.objects.filter(name=name)
    if not exist:
        NewsCategory.objects.create(name=name)
        return restful.ok()
    else:
        return restful.params_error(message='该分类已存在')


@require_POST
@permission_required(perm="news.change_newscategory",login_url='/')
def edit_news_category(request):
    form = EditNewsCategoryForm(request.POST)
    if form.is_valid():
        pk = form.cleaned_data.get('pk')
        name = form.cleaned_data.get('name')
        try:
            NewsCategory.objects.filter(pk=pk).update(name=name)
            return restful.ok()
        except:
            return restful.params_error(message='该分类不存在')
    else:
        return restful.params_error(message=form.get_errors())


@require_POST
@permission_required(perm="news.delete_newscategory",login_url='/')
def delete_news_category(request):
    pk = request.POST.get('pk')
    try:
        NewsCategory.objects.filter(pk=pk).delete()
        return restful.ok()
    except:
        return restful.params_error(message='该分类不存在！')


@require_POST
@staff_member_required(login_url='index')
def upload_file(request):
    file = request.FILES.get('file')
    name = file.name
    with open(os.path.join(settings.MEDIA_ROOT, name), 'wb') as fp:
        for chunk in file.chunks():
            fp.write(chunk)

    # 拼接url,  http://127.0.0.1:8000/media/001.png
    url = request.build_absolute_uri(settings.MEDIA_URL + name)
    return restful.result(data={'url': url})


@require_GET
@staff_member_required(login_url='index')
def qntoken(request):
    access_key = settings.QINIU_ACCESS_KEY
    secret_key = settings.QINIU_SECRET_KEY
    q = qiniu.Auth(access_key, secret_key)
    bucket = settings.QINIU_BUCKET_NAME
    token = q.upload_token(bucket)
    return restful.result(data={'token': token})



def banners(request):
    return render(request, 'cms/banners.html')


def news_list(request):
    categories = NewsCategory.objects.all()
    newses = News.objects.select_related('category', 'author').all()
    context = {
        'categories': categories,
        'newses': newses
    }
    return render(request, 'cms/news_list.html', context=context)


@method_decorator(permission_required(perm="news.change_news", login_url='/'), name='dispatch')
class NewsListView(View):
    def get(self, request):
        page = int(request.GET.get('p', 1))
        categories = NewsCategory.objects.all()
        newses = News.objects.select_related('category', 'author')

        start = request.GET.get('start')
        end = request.GET.get('end')
        title = request.GET.get('title')
        category_id = int(request.GET.get('category', 0) or 0)

        if start or end:
            if start:
                start_date = datetime.strptime(start, '%Y/%m/%d')
            else:
                start_date = datetime(year=2020, month=1, day=1)
            if end:
                end_date = datetime.strptime(end, '%Y/%m/%d')
            else:
                end_date = datetime.today()
            newses = newses.filter(pub_time__range=(make_aware(start_date), make_aware(end_date)))

        if title:
            newses = newses.filter(title__icontains=title)

        if category_id:
            newses = newses.filter(category_id=category_id)

        paginator = Paginator(newses, 10)
        page_obj = paginator.page(page)

        paginator_data = self.get_pagination_data(paginator, page_obj)

        context = {
            'categories': categories,
            'newses': page_obj.object_list,
            'page_obj': page_obj,
            'category_id': category_id,
            'url_query': '&' + parse.urlencode({
                'start': start or '',
                'end': end or '',
                'title': title or '',
                'category': category_id or ''
            }),
            'title': title,
            'start': start,
            'end': end
        }

        context.update(paginator_data)
        return render(request, 'cms/news_list.html', context=context)

    def get_pagination_data(self, paginator, page_obj, around_count=10):
        current_page = page_obj.number
        num_pages = paginator.num_pages
        left_has_more = False
        right_has_more = False

        if current_page <= around_count + 2:
            left_pages = range(1, current_page)
        else:
            left_pages = range(current_page - around_count, current_page)
            left_has_more = True

        if current_page >= num_pages - around_count - 1:
            right_pages = range(current_page + 1, num_pages + 1)
        else:
            right_pages = range(current_page + 1, current_page + around_count + 1)
            right_has_more = True

        return {
            'left_pages': left_pages,
            'right_pages': right_pages,
            'current_page': current_page,
            'left_has_more': left_has_more,
            'right_has_more': right_has_more,
            'num_pages': num_pages,
        }


@method_decorator(permission_required(perm="news.change_news",login_url='/'),name='dispatch')
class EditNewsView(View):
    def get(self, request):
        news_id = request.GET.get('news_id')
        news = News.objects.get(pk=news_id)
        category = NewsCategory.objects.all()

        context = {
            'news': news,
            'categories': category
        }
        return render(request, 'cms/write.html', context=context)

    def post(self, request):
        form = EditNewsForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data.get('title')
            desc = form.cleaned_data.get('desc')
            thumbnail = form.cleaned_data.get('thumbnail')
            content = form.cleaned_data.get('content')
            category_id = form.cleaned_data.get('category')
            pk = form.cleaned_data.get('pk')
            category = NewsCategory.objects.get(pk=category_id)
            print('=' * 30)
            print(type(category))
            print(category)
            print('=' * 30)
            News.objects.filter(pk=pk).update(title=title, desc=desc, thumbnail=thumbnail, content=content,
                                              category=category)
            return restful.ok()
        else:
            return restful.params_error(form.get_errors())


@require_POST
@permission_required(perm="news.delete_news",login_url='/')
def delete_news(request):
    news_id = request.POST.get('news_id')
    News.objects.filter(pk=news_id).delete()
    return restful.ok()
