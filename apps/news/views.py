from django.shortcuts import render
from apps.news.models import NewsCategory, News, Comment, Banner
from .serializers import NewsSerializers, CommentSerializers, BannerSerializers
from django.conf import settings
from utils import restful
from django.http import Http404
from .forms import NewsCommentForm
from apps.xfzauth.decorators import xfz_login_required
from apps.cms.forms import AddBannerForm, EditBannerForm
from django.db.models import Q
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import permission_required


def index(request):
    count = settings.ONE_PAGE_NEWS_COUNT
    news = News.objects.select_related('category', 'author').all()[0:count]
    category = NewsCategory.objects.all()
    context = {
        'newses': news,
        'categories': category,
        'banners': Banner.objects.all()
    }
    return render(request, 'news/index.html', context=context)


def news_list(request):
    # 通过p来指定获取第几页的数据,不传递就是1
    page = int(request.GET.get('p', 1))
    category_id = int(request.GET.get('category_id', 0))
    start = (page - 1) * settings.ONE_PAGE_NEWS_COUNT
    end = start + settings.ONE_PAGE_NEWS_COUNT
    if category_id == 0:
        newses = News.objects.select_related('category', 'author').all()[start:end]
    else:
        newses = News.objects.select_related('category', 'author').filter(category__id=category_id)[start:end]
    serializers = NewsSerializers(newses, many=True)
    data = serializers.data
    return restful.result(data=data)


def news_detail(request, news_id):
    try:
        news = News.objects.select_related('category', 'author').prefetch_related('comments__user').get(pk=news_id)
        context = {
            'news': news
        }
        return render(request, 'news/news_detail.html', context=context)
    except News.DoesNotExist:
        return Http404


@xfz_login_required
def pub_comment(request):
    form = NewsCommentForm(request.POST)
    if form.is_valid():
        content = form.cleaned_data.get('content')
        news_id = form.cleaned_data.get('news_id')
        try:
            news = News.objects.get(pk=news_id)
        except news.DoesNotExist:
            return restful.params_error(message='该评论文章不存在')
        comment = Comment.objects.create(content=content, news=news, user=request.user)
        # 这里不需要加many=True，因为这只是一个创建的对象，上面那个是一个Queryset集合
        serializers = CommentSerializers(comment)
        data = serializers.data
        return restful.result(data=data)
    else:
        return restful.params_error(message=form.get_errors())

@permission_required(perm="news.add_teacher",login_url='/')
def add_banner(request):
    form = AddBannerForm(request.POST)
    if form.is_valid():
        thumbnail = form.cleaned_data.get('thumbnail')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')
        banner = Banner.objects.create(thumbnail=thumbnail, link_to=link_to, priority=priority)
        return restful.result(data={'banner_id': banner.id})
    else:
        return restful.params_error(form.get_errors())


def banner_list(request):
    banners = Banner.objects.all()
    serializers = BannerSerializers(banners, many=True)
    data = serializers.data
    return restful.result(data=data)


def delete_banner(request):
    banner_id = request.POST.get('banner_id')
    Banner.objects.filter(pk=banner_id).delete()
    return restful.ok()


def edit_banner(request):
    form = EditBannerForm(request.POST)
    if form.is_valid():
        thumbnail = form.cleaned_data.get('thumbnail')
        link_to = form.cleaned_data.get('link_to')
        priority = form.cleaned_data.get('priority')
        pk = form.cleaned_data.get('pk')
        Banner.objects.filter(pk=pk).update(thumbnail=thumbnail, link_to=link_to, priority=priority)
        return restful.ok()
    else:
        return restful.params_error(form.get_errors())


def search(request):
    q = request.GET.get('q')
    print(q)
    context = {}
    if q:
        newses = News.objects.filter(Q(title__icontains=q) | Q(content__icontains=q))
        print(newses)
        context['newses'] = newses
        context['q'] = q
    return render(request, 'search/search.html', context=context)
