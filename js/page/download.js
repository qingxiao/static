/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-13
 * Time: 下午1:31
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "helper"], function ($, helper) {
    var page = {
        init: function () {
            var _this = this;
            var $download_pop = $(".download_pop");
            $(".download_code").click(function () {
                $download_pop.show();
                return false;
            });
            /* $(".download_code").mouseenter(function () {
             $download_pop.show();
             return false;
             });*/
            $("body").click(function () {
                $download_pop.hide();
            });

            this.imageRoll();

            $("#btnContainer").on({
                click: function () {
                    var $btn = $(this);
                    _this.imageRoll($btn.index());

                }
            }, ".download_selectBtn");

            var $win = $(window),
                timer,
                $download_lines = $(".download_con .download_line");
            if(helper.browser.msie ){
                $download_lines.addClass("tra_ie");
            }else{
                $win.bind("scroll", function () {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        var st = $(document).scrollTop();
                        $download_lines.each(function () {
                            var $line = $(this),
                                top = $line.offset().top;
                            if ($line.hasClass("tra")) {
                                return;
                            }
                            if (st + $win.height() >= top) {
                                $line.addClass("tra");
                            }
                        });
                    }, 50);
                });
                $win.trigger("scroll");
            }

        },
        imageRoll: function (idx) {
            idx = idx || 0;
            if (this.rollTimer) {
                clearTimeout(this.rollTimer);
            }
            var imgs = $(".download_img_rolling").find("img"),
                $btns = $("#btnContainer").children(),
                maxLen = imgs.length,
                i = idx + 1,
                _this = this;

            imgs.each(function () {
                $(this).css("zIndex", 2);
            });
            _this.doRoll(i, i - 1);
            this.rollTimer = setInterval(function () {
                if (i >= maxLen) {
                    i = 0;
                }
                var last = i - 1;
                if (last < 0) {
                    last = maxLen - 1;
                }
                _this.doRoll(last, i);
                i++;
            }, 3000);
        },
        doRoll: function (last, i) {
            var imgs = $(".download_img_rolling").find("img"),
                $btns = $("#btnContainer").children(),
                fadeTime = 1000;
            imgs.eq(last).fadeOut(fadeTime, function () {
                $(this).css({zIndex: 2}).hide();
            });
            imgs.eq(i).css({zIndex: 3}).hide().fadeIn(fadeTime, function () {

            });
            $btns.removeClass("on");
            $btns.eq(i).addClass("on");
        }
    };
    return page;
});