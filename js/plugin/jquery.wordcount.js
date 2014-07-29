/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-2-26
 * Time: 上午11:46
 * To change this template use File | Settings | File Templates.
 * desc: 字数统计，
 */
define(['jquery'], function ($) {

    $.fn.wordcount = function (options) {
        var defaults = {
            maxLength:140,                                 //最大可输入长度
            textEl:"",                                     //显示text和passText的元素
            text:"您还可以输入<span>{count}</span>字",
            passText:"已超出<span>{count}</span>字",
            textCss:"count-tip",
            passTextCss:"pass-count-tip"
        };
        options = $.extend(defaults, options);

        if(!this || this.length==0){
            return this;
        }
        this.each(function() {
            var $show = $(options.textEl);
            var $textarea = $(this);
            var count_timer = 0;

            setTimeout(function(){
                checkCount($textarea, $show, options);
            }, 150);
            $textarea.bind('keydown keyup focus change input blur', function (event) {
                if (count_timer) {
                    clearTimeout(count_timer);
                }
                count_timer = setTimeout(function () {
                    checkCount($textarea, $show, options);
                }, 100);
            });
            $textarea.bind("paste cut", function () {
                //input paste 右键粘贴需要 input:html5   paste:ie
                if (window.clipboardData) {
                    /*
                     var clip = window.clipboardData.getData('Text');
                     onpaste 事件执行完了  textarea的value还是原值，
                     模拟异步一下，让文本框先赋值，再触发change事件，计算字数
                     */
                    setTimeout(function () {
                        $textarea.change();
                    }, 0);
                }
            });
        });
        //文本计数的主要方法
        function checkCount($textarea, $show, option) {
            //中文替换为两个字符

            var len = 0;
            if ($textarea.attr("placeholder") == $textarea.val() && $textarea.hasClass("placeholder")) {
                //兼容 jquery.placeholder 插件， 避免计算placeholder的字符长度
            } else {
                //var reg = /[\u4e00-\u9fbf]/g;  //汉字
                var reg = /[\u0391-\uFFE5]/g;//双字节（汉字+双字节字符）
                var temp_str = $textarea.val().replace(reg, "aa");
                temp_str = $.trim(temp_str);
                len = Math.ceil(temp_str.length / 2);
            }
            var text = "";
            if (len <= option.maxLength) {
                text = option.text.replace(/\{count\}/, function () {
                    return Math.abs(option.maxLength - len);
                });
                $show.addClass(option.textCss).removeClass(option.passTextCss);
                $textarea.removeAttr("pass");
            } else {
                text = option.passText.replace(/\{count\}/, function () {
                    return Math.abs(len - option.maxLength);
                });
                $show.addClass(option.passTextCss);
                $textarea.attr("pass", Math.abs(len - option.maxLength));
            }
            $show.html(text);
        }
        return this;
    };
    return $;
});
