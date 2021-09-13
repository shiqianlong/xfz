function Banners() {

}

Banners.prototype.run = function () {
    var self = this;
    self.listenAddBannersEvent();
    self.loadBanner();
};


Banners.prototype.listenAddBannersEvent = function () {
    var self = this;
    var addBtn = $('.add-banner-btn');
    addBtn.click(function () {
        var bannerListGroup = $('.banner-list-group');
        var length = bannerListGroup.children().length;
        if (length >= 6) {
            window.messageBox.showInfo('最多只能添加6张轮播图');
            return;
        }
        self.createBannerItem();
    });
};


Banners.prototype.addImageSelectEvent = function (bannerItem) {
    var image = bannerItem.find('.thumbnail');
    var imageInput = bannerItem.find('.image-input');
    image.click(function () {
        // siblings找到它的兄弟元素
        imageInput.click();
    });
    imageInput.change(function () {
        var file = this.files[0];
        var formData = new FormData();
        formData.append('file', file);
        xfzajax.post({
            'url': '/cms/upload_file/',
            'data': formData,
            'processData': false,
            'contentType': false,
            'success': function (result) {
                if (result['code'] === 200) {
                    var url = result['data']['url'];
                    image.attr('src', url)
                }
            }
        })
    })
};


Banners.prototype.addRemoveBannerEvent = function (bannerItem) {
    var closeBtn = bannerItem.find('.close-btn');
    closeBtn.click(function () {
        // 如果把获取bannerId放在click上面，那么会有一个bug
        // 添加后再点击删除，不会有提示
        var bannerId = bannerItem.attr('data-banner-id');
        if (bannerId) {
            xfzalert.alertConfirm({
                'text': '您确定要删除这个轮播图吗？',
                'confirmCallback': function () {
                    xfzajax.post({
                        'url': '/news/delete_banner/',
                        'data': {
                            'banner_id': bannerId
                        },
                        'success': function (result) {
                            if (result['code'] === 200) {
                                bannerItem.remove()
                                window.messageBox.showSuccess('删除成功！')
                            }
                        }
                    })
                }
            })
        } else {
            bannerItem.remove()
        }
    })
};


Banners.prototype.addSaveBannerEvent = function (bannerItem) {
    var saveBtn = bannerItem.find('.save-btn');
    var priority = bannerItem.find('input[name="position"]');
    var linkTo = bannerItem.find('input[name="link_to"]');
    var thumbnail = bannerItem.find('.thumbnail');
    var prioritySpan = bannerItem.find('span[class="priority"]');

    saveBtn.click(function () {
        var priorityInput = priority.val();
        var linkToInput = linkTo.val();
        var image_url = thumbnail.attr('src');
        // 修改时获取id
        var bannerId = bannerItem.attr('data-banner-id');
        var url = '';
        if (bannerId) {
            url = '/news/edit_banner/'
        } else {
            url = '/news/add_banner/'
        }
        xfzajax.post({
            'url': url,
            'data': {
                'priority': priorityInput,
                'link_to': linkToInput,
                'thumbnail': image_url,
                'pk': bannerId
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    if (bannerId) {
                        window.messageBox.showSuccess('修改成功！');
                    } else {
                        bannerId = result['data']['banner_id'];
                        bannerItem.attr('data-banner-id', bannerId);
                        window.messageBox.showSuccess('添加成功！')
                    }
                    prioritySpan.text('优先级 ' + priorityInput);
                }
            }
        })
    })
};


Banners.prototype.loadBanner = function () {
    var self = this;
    xfzajax.get({
        'url': '/news/banner_list/',
        'success': function (result) {
            if (result['code'] === 200) {
                var banners = result['data'];
                for (var i = 0; i < banners.length; i++) {
                    var banner = banners[i];
                    self.createBannerItem(banner)
                }
            }
        }
    })
};

Banners.prototype.createBannerItem = function (banner) {
    var self = this;
    var tpl = template('banner-item', {'banner': banner});
    var bannerListGroup = $('.banner-list-group');
    var bannerItem = null;
    if (banner) {
        bannerListGroup.append(tpl);
        bannerItem = bannerListGroup.find('.banner-item:last');
    } else {
        bannerListGroup.prepend(tpl);
        bannerItem = bannerListGroup.find('.banner-item:first');
    }
    self.addImageSelectEvent(bannerItem);
    self.addRemoveBannerEvent(bannerItem);
    self.addSaveBannerEvent(bannerItem);
};


$(function () {
    var banners = new Banners();
    banners.run()
});