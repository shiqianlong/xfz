function NewsCategory() {

}

NewsCategory.prototype.run = function () {
    var self = this;
    self.listenAddCategoryEvent();
    self.listenEditCategoryEvent();
    self.listenDeleteCategoryEvent();
};


NewsCategory.prototype.listenAddCategoryEvent = function () {
    var addBtn = $('#add-btn');
    addBtn.click(function () {
        xfzalert.alertOneInput({
            'title': '添加新闻分类',
            'placeholder': '请输入文章分类名称',
            'confirmCallback': function (inputValue) {
                xfzajax.post({
                    'url': '/cms/add_news_category/',
                    'data': {
                        'name': inputValue
                    },
                    'success': function (result) {
                        if (result['code'] === 200) {
                            console.log(result);
                            window.location.reload()
                        }else {
                            xfzalert.close();
                        }
                    }
                })
            }
        })
    })
};


NewsCategory.prototype.listenEditCategoryEvent = function () {
    var editBtn = $('.edit-btn');
    editBtn.click(function () {
        // 这下面的this代表的时editBtn这个对象
        var current = $(this);
        var tr = current.parent().parent();
        var pk = tr.attr('data-pk');
        var name = tr.attr('data-name');
        xfzalert.alertOneInput({
            'title': '编辑文章分类',
            'placeholder': '请输入新的分类名称',
            'value': name,
            'confirmCallback': function (inputValue) {
                console.log(inputValue)
                xfzajax.post({
                    'url': '/cms/edit_news_category/',
                    'data': {
                        'pk': pk,
                        'name': inputValue
                    },
                    'success':function (result) {
                        if (result['code']===200){
                            window.location.reload()
                        }else {
                            xfzalert.close();
                        }
                    }
                })
            }
        })
    })
};


NewsCategory.prototype.listenDeleteCategoryEvent = function () {
    var deleteBtn = $('.delete-btn');
    deleteBtn.click(function () {
        var current = $(this);
        var tr = current.parent().parent();
        var pk = tr.attr('data-pk');
        xfzalert.alertConfirm({
            'title':'您确定删除该分类',
            'confirmCallback':function () {
                xfzajax.post({
                    'url':'/cms/delete_news_category/',
                    'data':{
                        'pk':pk
                    },
                    'success':function (result) {
                        if (result['code']===200){
                            window.location.reload()
                        }else {
                            xfzalert.close();
                        }
                    }
                })
            }
        })
    })
};


$(function () {
    var newsCategory = new NewsCategory();
    newsCategory.run();
});