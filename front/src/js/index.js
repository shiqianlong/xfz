// 面向对象
// 1. 添加属性，通过this关键字绑定属性，并且制定其他值
// 2. 添加方法，Banner.prototype上绑定方法即可


// function Banner() {
//     // 这个里面写代码，相当于python中的__init__方法
//     console.log('init')
//     // 添加属性
//     this.person = 'ziwu'
// }
//
// Banner.prototype.greet = function () {
//     console.log('添加方法')
// }
//
// var banner = new Banner();
// console.log(banner.person);
// banner.greet()


function Banner() {
    this.bannerGroup = $("#banner-group");
    this.index = 1;
    this.leftArrow = $('.left-arrow');
    this.rightArrow = $('.right-arrow');
    this.bannerUl = $('#banner-ul')
    this.liList = this.bannerUl.children("li");
    this.bannerCount = this.liList.length;
    this.bannerWidth = 798;
    this.pageControl = $('.page-control')
}

Banner.prototype.toggleArrow = function (isShow) {
    var self = this;
    if (isShow) {
        self.leftArrow.show();
        self.rightArrow.show();
    } else {
        self.leftArrow.hide();
        self.rightArrow.hide();
    }
};


Banner.prototype.ListenBannerHover = function () {
    // 这个this代表的时Banner对象
    var self = this;
    // 这里面如果有this,那么应该代表的这个函数(hover)
    this.bannerGroup.hover(function () {
        // 两个函数，1.把鼠标移动到banner的函数，2.移走执行的函数
        // 关闭定时器
        clearInterval(self.timer);
        self.toggleArrow(true)
    }, function () {
        self.loop();
        self.toggleArrow(false);
    })
};

Banner.prototype.loop = function () {
    var self = this;
    var bannerUl = $('#banner-ul');
    this.timer = setInterval(function () {
        // 定时器需要传递两个参数，需要需要执行的事情（function）,间隔时间（间隔一定时间执行函数）
        // 定时器会返回一个接收变量
        if (self.index >= self.bannerCount + 1) {
            // self.index = 0;
            self.bannerUl.css({"left": -self.bannerWidth});
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate();
    }, 2000);
};


Banner.prototype.listenArrowClick = function () {
    var self = this;
    self.leftArrow.click(function () {
        if (self.index === 0) {
            // self.index = self.bannerCount - 1;
            self.bannerUl.css({"left": -self.bannerCount * self.bannerWidth});
            self.index = self.bannerCount - 1
        } else {
            self.index--;
        }
        self.animate();
    });

    self.rightArrow.click(function () {
        if (self.index === self.bannerCount + 1) {
            // self.index = 0;
            self.bannerUl.css({'left': -self.bannerWidth})
            self.index = 2;
        } else {
            self.index++;
        }
        self.animate()
    })
};

Banner.prototype.animate = function () {
    var self = this;
    self.bannerUl.stop().animate({"left": -798 * self.index}, 500);
    var index = self.index;
    if (index === 0) {
        index = self.bannerCount - 1;
    } else if (index === self.bannerCount + 1) {
        index = 0;
    } else {
        index = self.index - 1;
    }
    self.pageControl.children("li").eq(index).addClass('active').siblings().removeClass('active')
};


Banner.prototype.initPageControl = function () {
    var self = this;
    for (var i = 0; i < self.bannerCount; i++) {
        // 创建li标签
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        if (i === 0) {
            // 添加类属性
            circle.addClass("active")
        }
    }
    self.pageControl.css({"width": self.bannerCount * 12 + 8 * 2 + 16 * (self.bannerCount - 1)})
};

Banner.prototype.initBanner = function () {
    var self = this;
    // 获取第0个li标签
    var firstBanner = self.liList.eq(0).clone();
    var lastBanner = self.liList.eq(self.bannerCount - 1).clone();
    self.bannerUl.append(firstBanner);
    self.bannerUl.prepend(lastBanner);
    this.bannerUl.css({"width": self.bannerWidth * (self.bannerCount + 2), "left": -self.bannerWidth});

};


Banner.prototype.listenPageControl = function () {
    var self = this;
    self.pageControl.children("li").each(function (index, obj) {
        // each遍历所有li标签,index下标值，obj标签本身
        // console.log(index);
        // console.log(obj);
        // console.log('=======')
        $(obj).click(function () {
            self.index = index;
            self.animate();
            // sibling找到所有的兄弟节点,并删除类
        })
    })
};


Banner.prototype.run = function () {
    console.log("ssss");
    this.loop();
    this.ListenBannerHover();
    this.listenArrowClick();
    this.initPageControl();
    this.initBanner();
    this.listenPageControl();
    this.ListenBannerHover();
    this.toggleArrow();
};


function NewsTab() {
    this.liList = $('.list-tab').children("li");
    this.index = 0;
}

NewsTab.prototype.listenNewstabClick = function () {
    var self = this;

    self.liList.each(function (index, obj) {
        $(obj).click(function () {
            self.index = index;
            self.liList.eq(index).addClass('active').siblings().removeClass('active')
        })
    });
    // self.liList.eq(self.index).addClass('active').siblings().removeClass('active')
    // self.liList.eq(self.index).addClass('active')

    // self.liList.click(function () {
    //
    // })
};


NewsTab.prototype.run = function () {
    this.listenNewstabClick();
};


function Index() {
    var self = this;
    self.page = 2;
    self.category_id = 0;
    self.loadBtn = $('#load-more-btn');
}

Index.prototype.run = function () {
    var self = this;
    self.listenLoadMoreEvent();
    self.listenCategorySwitchEvent();
};


Index.prototype.listenLoadMoreEvent = function () {
    var self = this;
        self.loadBtn.click(function () {
            xfzajax.get({
                'url': '/news/list/',
                'data': {
                    'p': self.page,
                    'category_id':self.category_id
                },
                'success': function (result) {
                    if (result['code'] === 200) {
                        var newses = result['data'];
                        if (newses.length > 0) {
                            var tpl = template("news-item", {'newses': newses})
                            var ul = $('.list-inner-group')
                            ul.append(tpl)
                            self.page++;
                        } else {
                            self.loadBtn.hide();
                        }
                    }
                }
            })
        })
};

Index.prototype.listenCategorySwitchEvent = function () {
    var self = this;
    var tabGroup = $('.list-tab');
    tabGroup.children().click(function () {
        var li = $(this);
        var category_id = li.attr('data-category');
        var page = 1;
        xfzajax.get({
            'url': '/news/list/',
            'data': {
                'p': page,
                'category_id': category_id
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var newses = result['data'];
                    var tpl = template('news-item', {"newses": newses})
                    self.category_id = category_id;
                    var newsListGroup = $('.list-inner-group');
                    self.page = 2;
                    newsListGroup.empty();
                    newsListGroup.append(tpl)
                    self.loadBtn.show();
                }
            }
        })
    })
};


$(function () {
    // 保证在整个文档元素全部加载完毕之后在执行
    var banner = new Banner();
    banner.run();

    var newsTab = new NewsTab();
    newsTab.run();

    var index = new Index();
    index.run();
});