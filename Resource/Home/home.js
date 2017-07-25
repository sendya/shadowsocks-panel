/**
 * Project: shadowsocks-panel
 * Author: Sendya <18x@loacg.com>
 * Time: 2016/4/8 21:32
 */
var bgm = $("#bgmusic")[0];bgm.volume = .1;

setInterval(function () {
    var ele = $("#flowMessage");
    var height = ele.css("margin-bottom");
    if (height == "-20px") {
        ele.css("margin-bottom", "0px");
    } else {
        ele.css("margin-bottom", "-20px");
    }
}, 1500);

var IMGNUM = 1,imgs = [], rds = Math.random(), rgImg;

imgs.push({
    src:BASEDIR + "1.jpg",
    fade:1e3
});

$("body").vegas({
    delay:6e3,
    shuffle:true,
    transitionDuration:2e3,
    slides:imgs,
    walk: function (index, slideSettings) {
        // console.log("Slide index " + index + " image " + slideSettings.src);
        // 预留事件
    }
});

$("#aconsole").click(function() {
    if (!bgm.paused) {
        bgm.pause();
        $(this).html("ON BGM");
    } else {
        bgm.play();
        $(this).html("OFF BGM");
    }
});

$(document).keydown(function(event) {
    if (event.keyCode == 37) {
        if (bgm.volume > 0) bgm.volume = bgm.volume - .1;
    } else if (event.keyCode == 39) {
        if (bgm.volume < 1) bgm.volume = bgm.volume + .1;
    }
});