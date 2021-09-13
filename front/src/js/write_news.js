function News() {

}


News.prototype.run = function () {
    var self = this;
    // 上传到自己的服务器
    // self.listenUploadFileEvent();
    self.lisstenQiniuUploadFileEvent();
    self.initUEditor();
    self.listenSubmitEvent();
};


News.prototype.listenUploadFileEvent = function () {
    var uploadBtn = $('#thumbnail-btn');
    uploadBtn.change(function () {
        // uploadBtn[0]：找到第一个uploadBtn标签
        // files[0]：files表示可以上传多个文件，在这里只要第一个文件
        var file = uploadBtn[0].files[0];
        var formData = new FormData();
        formData.append('file', file);
        xfzajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            // 告诉jQuery不需要对文件格式进行处理了
            'processData': false,
            // 使用默认的文件形式，不需要在添加了
            'contentType': false,
            'success': function (result) {
                if (result['code'] === 200) {
                    url = result['data']['url'];
                    var thumbnailInput = $('#thumbnail-form');
                    thumbnailInput.val(url)
                }
            }
        })
    })
};


News.prototype.lisstenQiniuUploadFileEvent = function () {
    var self = this;
    var uploadBtn = $('#thumbnail-btn')
    uploadBtn.change(function () {
        var file = this.files[0];
        xfzajax.get({
            'url': '/cms/qntoken/',
            'success': function (result) {
                if (result['code'] === 200) {
                    var token = result['data']['token']
                    var key = (new Date()).getTime() + '.' + file.name.split('.')[1];
                    var putExtra = {
                        fname: key,
                        params: {},
                        mimeType: ['image/png', 'image/jpeg', 'video/x-ms-wmv']
                    };
                    var config = {
                        useCdnDomain: true,
                        retryCount: 6,
                        region: qiniu.region.z2
                    };
                    var observable = qiniu.upload(file, key, token, putExtra, config);
                    observable.subscribe({
                        'next': self.handleUploadProgress,
                        'error': self.hanleUploadError,
                        'complete': self.hanleUploadComplete
                    })
                }
            }
        })
    })
};

News.prototype.handleUploadProgress = function (response) {
    var total = response.total;
    var percent = total.percent;
    var progressGroup = News.progressGroup;
    var progressBar = News.progressBar;
    var percentText = percent.toFixed(0) + '%';
    progressGroup.show();
    progressBar.css({'width': percentText});
    progressBar.text(percentText);
    console.log(percent)
};


News.prototype.hanleUploadError = function (error) {
    console.log(error.message)
};

News.prototype.hanleUploadComplete = function (response) {
    console.log(response);
    var progressGroup = News.progressGroup;
    progressGroup.hide();
    var progressBar = News.progressBar;
    progressBar.css({'width': '0'});
    var domain = 'http://cdn.shiqianlong.top/';
    var filename = response.key;
    var url = domain + filename;
    var thumbnailInput = $("input[name='thumbnail']");
    thumbnailInput.val(url)
};


News.prototype.initUEditor = function () {
    // 将ue绑定到window上面，成为全局变量
    window.ue = UE.getEditor('editor', {
        // 设置编辑器的高度
        'initialFrameHeight': 400,
        'serverUrl': '/ueditor/upload/'
    });
};


// 监听点击提交文章事件
News.prototype.listenSubmitEvent = function () {
    var submitBtn = $('#submit-btn');
    submitBtn.click(function (event) {
        var btn = $(this);
        var news_id = btn.attr('data-news-id');
        var url = '';
        if (news_id) {
            url = '/cms/edit_news/'
        } else {
            url = '/cms/write_news/'
        }
        event.preventDefault();
        var title = $('input[name="title"]').val();
        var category = $('select[name="category"]').val();
        var desc = $('input[name="desc"]').val();
        var thumbnail = $('input[name="thumbnail"]').val();
        if (thumbnail === '') {
            thumbnail = 'http://cdn.shiqianlong.top/ziwu.png'
        }
        var content = window.ue.getContent();
        
        xfzajax.post({
            'url': url,
            'data': {
                'title': title,
                'category': category,
                'desc': desc,
                'thumbnail': thumbnail,
                'content': content,
                'pk': news_id
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    if (news_id) {
                        xfzalert.alertSuccess('编辑成功', function () {
                            window.location.reload()
                        })
                    } else {
                        xfzalert.alertSuccess('发布成功', function () {
                            window.location.reload()
                        })
                    }
                }
            }
        })
    })
};


$(function () {
    var news = new News();
    news.run();

    // 性能优化：在七牛云上传文件时属性绑定在这里
    News.progressGroup = $('.progress');
    News.progressBar = $('.progress-bar');
});