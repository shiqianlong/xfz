console.log('欢迎加入我们：www.baidu.com')

// $(function () {
//     $('#btn').click(function () {
//         $('.mask-wrapper').show()
//     });
//
//     $('.close-btn').click(function () {
//         $('.mask-wrapper').hide()
//     })
// });
//
//
// $(function () {
//     $('.switch').click(function () {
//         var scrollWrapper = $(".scroll-group");
//         var currentLeft = scrollWrapper.css("left");
//         currentLeft = parseInt(currentLeft);
//         if (currentLeft < 0) {
//             scrollWrapper.animate({"left": "0"})
//         } else {
//             scrollWrapper.animate({"left": "-400px"})
//         }
//     })
// });

function Auth() {
    var self = this;
    self.maskWrapper = $('.mask-wrapper');
}

Auth.prototype.run = function () {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
};

Auth.prototype.showEvent = function () {
    var self = this;
    self.maskWrapper.show();
};

Auth.prototype.hideEvent = function () {
    var self = this;
    self.maskWrapper.hide();
};

Auth.prototype.listenShowHideEvent = function () {
    var self = this;
    var signinBtn = $('.signin-btn');
    var signupBtn = $('.signup-btn');
    var closeBtn = $('.close-btn');
    var scrollGroup = $('.scroll-group');
    signinBtn.click(function () {
        self.showEvent();
        scrollGroup.css({'left': '0'})
    });

    signupBtn.click(function () {
        self.showEvent();
        scrollGroup.css({'left': '-400px'})
    });

    closeBtn.click(function () {
        self.hideEvent();
    })
};

Auth.prototype.listenSwitchEvent = function () {
    var switcher = $('.switch');
    switcher.click(function () {
        var scrollWrapper = $(".scroll-group");
        var currentLeft = scrollWrapper.css("left");
        currentLeft = parseInt(currentLeft);
        if (currentLeft < 0) {
            scrollWrapper.animate({"left": "0"})
        } else {
            scrollWrapper.animate({"left": "-400px"})
        }
    })
};

Auth.prototype.listenSigninEvent = function () {
    var self = this;
    var signinGroup = $('.signin-group');
    var telephoneInput = signinGroup.find('input[name="telephone"]');
    var passwordInput = signinGroup.find('input[name="password"]');
    var rememberInput = signinGroup.find('input[name="remember"]');

    var sumbitBtn = signinGroup.find('.submit-btn')
    sumbitBtn.click(function () {
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
        // 对于记住我的checked的获取
        var remember = rememberInput.prop('checked')

        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember ? 1 : 0
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    self.hideEvent();
                    window.messageBox.show('登录成功！');
                    window.location.reload();
                } else {
                    var messageObject = result['message'];
                    // 判断是否是字符串，做兼容性处理
                    if (typeof messageObject == "string" || messageObject.constructor == String) {
                        window.messageBox.show(messageObject)
                    } else {
                        for (var key in messageObject) {
                            var messages = messageObject[key];
                            var message = messages[0]
                            window.messageBox.show(message)
                        }
                    }
                }
            },
            'fail': function (error) {
                console.log(error)
            }
        })
    })
};


$(function () {
    var auth = new Auth();
    auth.run()
});