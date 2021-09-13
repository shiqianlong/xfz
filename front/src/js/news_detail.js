function NewsList() {

}


NewsList.prototype.run = function () {
    var self = this;
    self.listenCommentEvent();
};


NewsList.prototype.listenCommentEvent = function () {
    var submitBtn = $('.submit-btn');
    var textarea = $('textarea[name="comment"]')
    submitBtn.click(function () {
        var content = textarea.val()
        var news_id = textarea.attr('data-news-id')
        xfzajax.post({
            'url':'/news/pub_comment/',
            'data':{
                'content':content,
                'news_id':news_id
            },
            'success':function (result) {
                if (result['code']===200){
                    window.messageBox.showSuccess('评论发表成功！')
                    var comment = result['data']
                    var commentList = $('.comment-list');
                    tpl = template('comment-list',{'comment':comment})
                    commentList.prepend(tpl)
                    textarea.val("")
                }else {
                    window.messageBox.showError(result['message'])
                    textarea.val("")
                }
            }
        })
    })
};


$(function () {
    var newsList = new NewsList();
    newsList.run();
});