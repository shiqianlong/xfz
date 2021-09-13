function PubCourse() {

}

PubCourse.prototype.run = function () {
    var self = this;
    self.initUEditor();
    self.listenSubmitEvent();
};


PubCourse.prototype.initUEditor = function () {
    window.ue = UE.getEditor("editor", {
        'serverUrl': '/ueditor/upload/'
    });
};


PubCourse.prototype.listenSubmitEvent = function () {
    var pubBtn = $('.pub-btn');
    pubBtn.click(function () {
        var title = $('#title-input').val();
        var category_id = $('#category-input').val();
        var teacher_id = $('#teacher-input').val();
        var video_url = $('#video-input').val();
        var cover_url = $('#cover-input').val();
        var price = $('#price-input').val();
        var duration = $('#duration-input').val();
        var profile = window.ue.getContent();
        xfzajax.post({
            'url': '/cms/pub_course/',
            'data': {
                'title': title,
                'category_id': category_id,
                'teacher_id': teacher_id,
                'video_url': video_url,
                'cover_url': cover_url,
                'price': price,
                'duration': duration,
                'profile': profile
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    xfzalert.alertSuccess('发布成功', function () {
                        window.location = window.location.href;
                    })

                }
            }
        })
    })
};


$(function () {
    var pubCourse = new PubCourse();
    pubCourse.run();
});