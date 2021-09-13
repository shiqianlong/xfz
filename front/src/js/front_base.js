// 导航栏
function FrontBase() {

}

FrontBase.prototype.run = function () {
    var self = this;
    self.listenAuthBoxHover();
};


FrontBase.prototype.listenAuthBoxHover = function () {
    var userMoreBox = $('.user-more-box');
    var authBox = $('.auth-box');
    authBox.hover(function () {
        userMoreBox.show();
    }, function () {
        userMoreBox.hide();
    })
};


$(function () {
    var frontBase = new FrontBase();
    frontBase.run();
});


// auth登录注册
function Auth() {
    var self = this;
    self.maskWrapper = $('.mask-wrapper');
    self.smsCaptcha = $('.sms_captcha');
}

Auth.prototype.run = function () {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
    self.lintenImgCaptchaEvent();
    self.listenSmsCaptchaEvent();
    self.listenSignupEvent();
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


Auth.prototype.lintenImgCaptchaEvent = function () {
    var imgCaptcha = $('.img_captcha');
    imgCaptcha.click(function () {
        imgCaptcha.attr("src", "/account/img_captcha/" + "?random=" + Math.random())
    })
};

Auth.prototype.listenSmsCaptchaEvent = function () {
    var self = this;
    var telephoneInput = $(".signup-group input[name='telephone']");
    self.smsCaptcha.click(function () {
        var telephone = telephoneInput.val();
        if (!telephone) {
            messageBox.showError('请输入手机号')
        }
        self.smsCaptcha.unbind('click');
        xfzajax.post({
            'url': '/account/sms_captcha/',
            'data': {
                'telephone': telephone
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    self.SmsSuccessEvent();
                }
            },
            'fail': function (error) {
                console.log(error)
            }
        })
    })
};

Auth.prototype.SmsSuccessEvent = function () {
    var self = this;
    messageBox.showInfo('短信验证码发送成功');
    self.smsCaptcha.addClass('disabled');
    var count = 60;
    var timer = setInterval(function () {
        self.smsCaptcha.text(count + 's');
        count--;
        if (count < 0) {
            clearInterval(timer);
            self.smsCaptcha.removeClass('disabled');
            self.smsCaptcha.text('发送验证码');
            self.listenSmsCaptchaEvent();
        }
    }, 1000)
};

Auth.prototype.listenSignupEvent = function () {
    var signupGroup = $('.signup-group');
    var signupBtn = signupGroup.find('.submit-btn');
    signupBtn.click(function (event) {
        event.preventDefault();
        var telephoneInput = signupGroup.find('input[name="telephone"]');
        var password1Input = signupGroup.find('input[name="password1"]');
        var password2Input = signupGroup.find('input[name="password2"]');
        var smsCaptchaInput = signupGroup.find('input[name="sms_captcha"]');
        var imgCaptchaInput = signupGroup.find('input[name="img_captcha"]');
        var usernameInput = signupGroup.find('input[name="username"]');

        var telephone = telephoneInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var smsCaptcha = smsCaptchaInput.val();
        var imgCaptcha = imgCaptchaInput.val();
        var username = usernameInput.val();
        xfzajax.post({
            'url': '/account/register/',
            'data': {
                'telephone': telephone,
                'password1': password1,
                'password2': password2,
                'sms_captcha': smsCaptcha,
                'img_captcha': imgCaptcha,
                'username': username
            },
            'success': function (result) {
                window.location.reload();
                window.messageBox.showSuccess('登录成功')
            }
        })
    })
};

$(function () {
    var auth = new Auth();
    auth.run()
});

$(function () {
    if (window.template) {
        template.defaults.imports.timeSince = function (dateValue) {
            var date = new Date(dateValue);
            // 得到毫秒级时间，方便下面相减
            var datets = date.getTime();
            // 得到现在的时间
            var nowts = (new Date()).getTime();
            // 获取时间戳(并转换成多少秒)
            var timestamp = (nowts - datets) / 1000;
            if (timestamp < 60) {
                return '刚刚'
            } else if (timestamp >= 60 && timestamp < 60 * 60) {
                minutes = parseInt(timestamp / 60);
                return minutes + '分钟前'
            } else if (timestamp >= 60 * 60 && timestamp < 60 * 60 * 24) {
                hours = parseInt(timestamp / 60 / 60);
                return hours + '小时前'
            } else if (timestamp >= 60 * 60 * 24 && timestamp < 60 * 60 * 24 * 30) {
                days = parseInt(timestamp / 60 / 60 / 24);
                return days + '天前'
            } else {
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDay();
                var hour = date.getHours();
                var minute = date.getMinutes();
                return year + '/' + month + '/' + day + '/' + ' ' + hour + ':' + minute
            }
        }
    }
})