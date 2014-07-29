/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-7
 * Time: 上午11:43
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', "module/player/player"], function ($, PageBase, player) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            $(".bodyBgColor").addClass("bodyBgColor2");
            this.$el = $("#discoverPage");
            this.$picWrapper = this.$el.find(".picWrapper");
            this.initSlide();
            //picshow.init(60, 60);
            $(".disRankUserPanel").on("click", function (e) {
                var $target = $(e.target);

                if($target.attr("href")){
                    return;
                }
                if($target.closest("a").size() !=0){
                    return;
                }
                if (!$target.size() || !$target.closest("[sound_id]").size()) {
                    var href = $(this).find(".rankUserPanel2 .userface60").attr("href");

                    if (href) {
                        location.href = href;
                    }
                    return false;
                }
            });
            player.render({ $container: this.$el, waveRenderDelay: true });
        },
        initSlide: function () {
            var $picWrapper = this.$picWrapper,
                $borderWrap = $picWrapper.find(".border-wrap"),
                cur_idx = 0,
                last_idx = -1,
                _this = this;
            this._slideStop = false;

            var borderMove = function ($nav, callback) {
                callback = callback || $.noop;
                var idx = $nav.index(),
                    height = $nav.height();
                var $last = $nav.parent().find(".on"),
                    animate_time = 320;
                if (helper.browser.msie && parseInt(helper.browser.version) <= 8) {
                    animate_time = 0;
                }
                $last.removeClass("on");
                $borderWrap.stop().animate({ top: idx * height }, animate_time, "linear", function () {
                    $nav.addClass("on");
                    $borderWrap.attr("href", $nav.attr("href"));
                    if (idx == last_idx) {
                        return;
                    }
                    _this.showSlideImg(idx, last_idx, $navs);
                    last_idx = $nav.index();
                    callback(last_idx);
                });
            };
            $picWrapper.on("mouseenter", ".nav", function () {
                var $nav = $(this);
                borderMove($nav);
            });
            $picWrapper.on({
                mouseenter: function () {
                    _this.stopSlide();
                },
                mouseleave: function () {
                    _this.startSlide();
                }
            });
            var $navs = $picWrapper.find(".nav"),
                max_idx = $navs.size() - 1;
            this._slideTimer = setInterval(function () {
                if (_this._slideStop) {
                    return;
                }
                if ($navs.eq(last_idx).attr("data-playing")) {
                    return;
                }
                if (cur_idx != last_idx) {
                    cur_idx = last_idx;
                }
                cur_idx++;
                if (cur_idx > max_idx) {
                    cur_idx = 0;
                }

                borderMove($navs.eq(cur_idx));
            }, 4000);
            borderMove($navs.eq(0));
        },
        showSlideImg: function (idx, last_idx, $navs) {
            var $picShow = this.$picWrapper.find(".picShow");
            var time = 300;
            if (helper.browser.msie && parseInt(helper.browser.version) <= 8) {
                time = 0;
            }
            $picShow.eq(last_idx).fadeOut(time, function () {
                player.render({ $container: $picShow });
            });
            //记录当然位置的img 声音是否在播放 如果在播放，当预览播放的图片的时候，不再滚动；
            $picShow.on("onSoundPlay", function () {
                var $this = $(this),
                    index = $this.index();
                $navs.eq(index).attr("data-playing", true);
            });
            $picShow.on("onSoundStop onSoundPause onSoundFinish", function () {
                var $this = $(this),
                    index = $this.index();
                $navs.eq(index).removeAttr("data-playing");
            });
            $picShow.eq(idx).fadeIn(time);
        },
        stopSlide: function () {
            this._slideStop = true;
        },
        startSlide: function () {
            this._slideStop = false;
        },
        release: function () {
            this.callParent("release");
            clearInterval(this._slideTimer);
            $(".bodyBgColor").removeClass("bodyBgColor2");
            //picshow.release();
        },
        render: function () {
        },
        afterRender: function () {
        },
        bindEvents: function () {
        }
    });
    return new Page();
});