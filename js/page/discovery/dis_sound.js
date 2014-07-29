/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/discovery/album_sound', "underscore","helper",
    "module/waterfall/model", "module/waterfall/view", 'model/sound',"module/dialogs/forward", 'plugin/jquery.menu-aim'],
    function ($, PageAlbumSound, _, helper, WaterfallModel, WaterfallView, SoundModel, forwardDialog) {

        var Page = PageAlbumSound.extend({
            url_track: "/explore/track_list",
            container:"#discoverSound",
            data: {
                category: 0,
                type: "voice",
                condition: "",
                tag:""
            },
            init: function () {
                this.initCommon();
                this.$container = $("#discoverSound");
                this.initWaterfall();
            },
            initData: function () {
                var $container = this.$container,
                    $curSort = $container.find(".sort_list li.on"),
                    $curNav = $container.find(".nav_list li.on");
                this.data.category = $curSort.attr("cid");
                this.data.condition = $curNav.attr("condition");
            },
            initWaterfall: function () {
                var $container = $(".waterfall_container");
                $container.find(".waterfall-pinsbox").remove();
                var _this = this;

                this.releaseWaterfall();

                var waterfallModel = new WaterfallModel({
                    url: _this.url_track
                });
                var waterfall = new WaterfallView({
                    model: waterfallModel,
                    el: $container[0]
                });
                var tempStr = $.trim($("#waterfall_item_template").html());
                if (!tempStr) {
                    return;
                }
                waterfall.setTemplate(tempStr);
                waterfall.init(this.data);
                this.waterfall = waterfall;
            },
            onTagSelect:function(){
                if(window.console) console.log(this.data);
                this.initWaterfall();
            },
            release: function () {
                this.callParent("release");
                this.releaseWaterfall();
                this.unbindEvents();
                //$("body").removeClass("bodyBgColor");
            },
            releaseWaterfall: function () {
                if (this.waterfall) {
                    this.waterfall.release();
                }
            },
            bindEvents: function () {
                this.callParent("bindEvents");
                var $container = this.$container,
                    $sortList = $container.find(".sort_list"),
                    _this = this;
                //声音item  hover事件  click事件
               /* $container.on("mouseenter", ".waterfall_item", function () {
                    var $item = $(this);
                    $item.parent().find(".hover").removeClass("hover");
                    $item.addClass("hover");
                });

                $container.on("mouseleave", ".waterfall_item", function () {
                    $(this).removeClass("hover");
                });*/

                $container.on("click", ".waterfall_item .item_wrap", function (e) {
                    if ($(e.target).hasClass("play_btn")) {
                        return;
                    }
                    var href = $(this).find(".title").attr("href");
                    if (href) {
                        window.location.href = href;
                    }
                });
                $container.on("click", ".waterfall_item .title", function (e) {
                    e.stopPropagation();
                });
                $container.on("click", ".waterfall_item .imgForwardBtn ", function (e) {
                    _this.forwardSound($(this));
                });
                $container.on("click", ".waterfall_item .imgLikeBtn ", function (e) {
                    _this.likeSound($(this));
                });
               // $(window).on("scroll", {self: this}, this.onWindowScroll);
                $container.on("onSoundIdSelect", ".waterfall_item", function (e) {
                    var $item = $(this),
                        $all =  $container.find(".waterfall_item"),
                        $last = $all.last(),
                        $next = $item.next();
                    if(window.console) console.log($last, $next);
                    if($last && $next && $last[0] == $next[0]){
                        if(window.console) console.log(this);
                        _this.waterfall.controlWindowScroll(true);
                    }
                });

            },
            unbindEvents: function () {
                this.callParent("unbindEvents");
                $(window).off("scroll", this.onWindowScroll);
            },
            onWindowScroll: function (e) {
                var self = e.data.self;
                self.controlWindowScroll();

            },
            controlWindowScroll: function () {
                var $container = this.$container,
                    $layoutRight = $container.find(".layout_right"),
                    $tagsPanel = $container.find(".tags_panel"),
                    $sortList = $container.find(".sort_list");

                if ($(document).scrollTop() > $layoutRight.offset().top - 60) {
                    if ($tagsPanel.attr("data-fixed")) {
                        $tagsPanel.addClass("fixed");
                    }
                    $sortList.addClass("fixed");
                } else {
                    $tagsPanel.removeClass("fixed");
                    $sortList.removeClass("fixed");
                }
            },
            forwardSound:function($btn){
                var $item = $btn.closest(".waterfall_item"),
                    soundId = $item.attr("sound_id");
                forwardDialog.open(soundId, false, function (response) {
                    var $info = $btn.find(".info");
                    if($info.size()==0){
                        $info = $("<span class='info'></span>");
                        $btn.find(".content").append($info);
                    }
                    var orig = parseInt($.trim($info.text())) || 0;
                    $info.text(response.track_shares_count || orig+1);
                });
            },
            likeSound: function ($btn) {
                var $item = $btn.closest(".waterfall_item"),
                    soundId = $item.attr("sound_id");
                var soundModel = new SoundModel({
                    id: soundId,
                    isFavorited: false
                });
                if ($btn.attr("data-in-operation")) {
                    return;
                }
                $btn.attr("data-in-operation", true);
                if ($btn.hasClass("liked")) {
                    this.unlike(soundId, function () {
                        $btn.removeClass("liked");
                        $btn.removeAttr("data-in-operation");
                    });
                } else {
                    this.unlike(soundId, function () {
                        $btn.addClass("liked");
                        var $content = $btn.find(".content"),
                            $contentClone = $content.clone();
                        $contentClone.css({position: "absolute", left: 0, top: 0});
                        $contentClone.insertAfter($content);
                        $contentClone.find(".icon").animate({marginTop: -$content.height(), opacity: 0.3}, 500, function () {
                            $contentClone.remove();
                            $btn.removeAttr("data-in-operation");
                        });
                    });
                }
            },
            like: function (soundId, success) {
                var soundId = this._soundId,
                    likeCount = parseInt(this._$likeCount.text(), 10) + 1;
                var soundModel = new SoundModel({
                    id: soundId,
                    isFavorited: true
                });
                soundModel.like(success);
            },
            /*
             * 取消喜欢
             */
            unlike: function (soundId, success) {
                var soundModel = new SoundModel({
                    id: soundId,
                    isFavorited: false
                });
                soundModel.unlike(success);
            }
        });
        return new Page();
    });