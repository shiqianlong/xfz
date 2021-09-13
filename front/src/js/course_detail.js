function CourseDetail() {

}


CourseDetail.prototype.run = function () {
    var self = this;
    self.initPlayer();
};


CourseDetail.prototype.initPlayer = function () {
    var videoInfoSpan = $('#video-info');
    var video_url = videoInfoSpan.attr('data-video-url');
    var cover_url = videoInfoSpan.attr('data-cover-url');
    var player = cyberplayer("playercontainer").setup({
        width: '100%',
        height: '100%',
        file: video_url,
        image: cover_url,
        autostart: false,
        stretching: "uniform",
        repeat: false,
        volume: 100,
        controls: true,
        tokenEncrypt: true,
        // AccessKey
        ak: '4ed27be507f14e70b5ed06355cb55fa9'
    });

    player.on('beforePlay', function (e) {
        if (!/m3u8/.test(e.file)) {
            return;
        }
        xfzajax.get({
            'url': '/course/course_token/',
            'data': {
                'video': video_url
            },
            'success': function (result) {
                if (result['code'] === 200) {
                    var token = result['data']['token'];
                    player.setToken(e.file, token);
                } else {
                    window.messageBox.showInfo(result['message']);
                    player.stop();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};


$(function () {
    var courseDetail = new CourseDetail();
    courseDetail.run();
});