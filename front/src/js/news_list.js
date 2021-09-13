function NewsList() {

}

NewsList.prototype.run = function () {
    var self = this;
    self.listenDataPickerEvent();
    self.listenDeleteNewsEvent();
};


NewsList.prototype.listenDataPickerEvent = function () {
    var startPicker = $('#startPicker');
    var endPicker = $('#endPicker');
    var todayDate = new Date();
    console.log(todayDate)
    var todayStr = todayDate.getFullYear() + '/' + (todayDate.getMonth() + 1) + '/' + todayDate.getDay();
    var options = {
        // 显示仪表盘
        'showButtonPanel': true,
        // 显示日期格式
        'format': 'yyyy/mm/dd',
        // 开始时间
        'startData': '2020/1/1',
        'endData':todayStr,
        // 显示中文
        'language': 'zh-CN',
        // 显示今天选项
        'todayBtn': 'linked',
        // 今天高亮
        'todayHighlight': true,
        // 显示清除按钮
        'clearBtn': true,
        // 自动关闭
        'autoclose': true

    };
    startPicker.datepicker(options);
    endPicker.datepicker(options);
};

NewsList.prototype.listenDeleteNewsEvent = function () {
    var deleteBtn = $('.delete-btn');
    deleteBtn.click(function () {
        var btn = $(this);
        var news_id = btn.attr('data-news-id');
        xfzalert.alertConfirm({
            'title':'您确定输出该文章吗？',
            'confirmCallback':function () {
                xfzajax.post({
                    'url':'/cms/delete_news/',
                    'data':{
                        'news_id':news_id
                    },
                    'success':function (result) {
                        if (result['code']===200){
                            window.messageBox.showSuccess('删除成功');
                            // 兼容火狐等浏览器的刷新
                            window.location = window.location.href;
                        }
                    }
                })
            }
        })
    })
};


$(function () {
    var newsList = new NewsList();
    newsList.run();
});