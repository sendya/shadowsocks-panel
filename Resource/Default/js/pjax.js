var ajx_main = '.main-content' , // 要替换的主体id，改为你的容器
    ajx_nav = '.sidebar-menu',
    ajx_a = 'a[class*="pjax"]'; // a标签，自己添加排除规则
function reload_func(){
    // 这里放置需要重载的JS或函数
    if(pageJSload&&typeof(pageJSload) == "function"){
        pageJSload();
    } else {
        console.log("不存在 pageJSload");
    }
}


$(function() {
    pjaxInit(); //pushState初始化执行一次
});
// 建立锚点函数，用于跳转后的滚动定位，使用这个主要是有侧栏评论带#号时能在请求后定位到该条评论的位置
function body_am(id) {
    id = isNaN(id) ? $('#' + id).offset().top : id;
    $("body,html").animate({
        scrollTop: id
    }, 0);
    return false;
}
function to_am(url) {
    var anchor = location.hash.indexOf('#'); // 用indexOf检查location.href中是否含有'#'号，如果没有则返回值为-1
    anchor = window.location.hash.substring(anchor + 1);
    body_am(anchor);
}

// 函数：从封装的Json获取
function getFormJson(frm) {
    var o = {};
    var a = $(frm).serializeArray();
    $.each(a,
        function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
    return o;
}
// 函数：更新浏览器历史缓存（用于浏览器后退）
function loadHistory(){
    history.replaceState( // 刷新历史点保存的数据，给state填入正确的内容
        {    url: window.document.location.href,
            title: window.document.title,
            html: $(document).find(ajx_main).html(), // 抓取主体部分outerHTML用于呈现新的主体。也可以用这句 html: $(ajx_main).prop('outerHTML'),
        }, window.document.title, document.location.href);
}
// 函数：页面载入初始一次，解决Chrome浏览器初始载入时产生ajax效果的问题,并且监听前进后退事件
function pjaxInit(){
    window.addEventListener( 'popstate', function( e ){  //监听浏览器后退事件
        if( e.state ){
            document.title = e.state.title;
            $(ajx_main).html( e.state.html ); //也可以用replaceWith ，最后这个html就是上面替换State后里面的html值
            // 重载js
            window.load =  reload_func(); // 重载函数
        }
    });
}
//函数：AJAX核心
function ajax(reqUrl, msg, method, dataTo) {
    if (msg == 'pagelink' || msg == 'search') { // 页面
        $(ajx_main).fadeTo('slow',0.6);
    }
    $.ajax({
        url: reqUrl,
        type: method,
        dataType: "html",
        data: dataTo,
        beforeSend : function () { //加载前操作 这个必须放在window.history.pushState()之前，否则会出现逻辑错误。
            loadHistory(); //刷新历史点内容，这个必须放在window.history.pushState()之前，否则会出现逻辑错误。
        },
        success: function(data) {
            if (msg == 'pagelink' || msg == 'search') { //
                $(ajx_main).html($(data).find(ajx_main).html()) ; // 替换原#main的内容
                $(ajx_nav).html($(data).find(ajx_nav).html());
                $(ajx_nav).attr({"class": $(data).parent().find(ajx_nav).attr("class")});
                setTimeout("$(ajx_main).fadeTo('normal',1)", 500);
            }
            document.title = $(data).filter("title").text(); // 浏览器标题变更
            if (msg != 'comment') { // —— 不为后退
                var state = { // 设置state参数
                    url: reqUrl,
                    title: $(data).filter("title").text(),
                    html: $(data).find(ajx_main).html(),
                };
                // 将当前url和历史url添加到浏览器当中，用于后退。里面三个值分别是: state, title, url
                window.history.pushState(state, $(data).filter("title").text(), reqUrl);
            }
        },
        complete: function() { // ajax完成后加载
            // 代码重载区
            if (msg == 'pagelink') { // 若msg为 页面链接
                to_am(reqUrl) ;// 定位到相应链接位置,这个必须放在window.history...之后执行，否则遇到带#号的链接，再点击其他链接地址栏就无法改变
            }
            window.load =  reload_func(); // 重载函数
        },
        timeout: 5000, // 超时长度
        error: function(request) { // 错误时的处理
            if (msg == msg == 'pagelink' || msg == 'search'){
                location.href = reqUrl;    //直接刷新跳转到请求的页面链接
            } else {
                location.href = reqUrl; //页面错误时跳转到请求的页面
            }
        },
    });
}
//页面ajax
//$('body').off("click");
$('body').on("click",ajx_a,
    function() {
        console.log("a click");
        ajax($(this).attr("href"), 'pagelink');
        return false;
    });