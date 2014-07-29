/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-8-13
 * Time: 下午2:07
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/dialog", "model/sound_images"], function ($, dialog, ImageModel) {
    var imageModel = new ImageModel();
    var slider = {
        open: function (imgId) {
            if(!imgId){
                return;
            }
            var _this = this;
            this.openDialog();
            imageModel.getData(imgId, function (data) {
                _this.renderImage(data);
            });
        },
        openDialog: function () {
            var html = '<div class="num"><span class="cur_order">1</span>/<span class="all_num"></span></div>' +
                '<div class="gCon">' +
                '<img src="">' +
                '<span class="imgLoad"></span>' +
                '<a title="上一张" class="prev disabled" href="javascript:;"><span></span></a>' +
                '<a title="下一张" class="next disabled" href="javascript:;"><span></span></a></div>' +
                '<ul class="gCon2">' +
                '</ul>';
            var op = {
                id: "imageSlider",
                content: html,
                fixed: false,
                template: {
                    dialog_container: '<div class="gPopupMulti"  dialog-role="container"></div>',
                    dialog_close: '<div class="close6Btn" dialog-role="close"></div>'
                }
            };
            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this,

                $gCon2 = this.$el.find(".gCon2"),
                $curOrder = this.$el.find(".cur_order"),
                $prev = this.$el.find(".prev"),
                $next = this.$el.find(".next");
            $gCon2.on("click", "li", function () {
                var $li = $(this),
                    imageLarge = $li.attr("image-large");
                if ($li.hasClass("on")) {
                    return;
                }
                _this.renderLargeImage(imageLarge);

                $gCon2.find(".on").removeClass("on");
                $li.addClass("on");
                $curOrder.html($li.index() + 1);
                if ($li.prev().size() == 0) {
                    $prev.addClass("disabled");
                } else {
                    $prev.removeClass("disabled");
                }

                if ($li.next().size() == 0) {
                    $next.addClass("disabled");
                } else {
                    $next.removeClass("disabled");
                }
            });
            $prev.on("click", function () {
                var $btn = $(this);
                if ($btn.hasClass("disabled")) {
                    return false;
                }
                var $curLi = $gCon2.find(".on");
                $curLi.prev().trigger("click");
                return false;
            });
            $next.on("click", function () {
                var $btn = $(this);
                if ($btn.hasClass("disabled")) {
                    return false;
                }
                var $curLi = $gCon2.find(".on");
                $curLi.next().trigger("click");
                return false;
            });
        },
        renderLargeImage: function (src) {
            var _this = this,
                $gCon = this.$el.find(".gCon"),
                $gConImage = $gCon.find("img");
            this.largeImage = src;
            $gCon.addClass("is-loading");
            $gCon.css("opacity", 0.5);
            var img = new Image();
            img.onload = function () {
                if (_this.largeImage != this.src) {
                    img = null;
                    return;
                }
                $gCon.removeClass("is-loading");
                $gConImage.attr("src", src);
                $gCon.animate({opacity: 1});
                _this.pop.setPosition();
                img = null;
            };
            img.onerror = function(){
                $gCon.removeClass("is-loading");
                img = null;
            };
            img.src = src;
        },
        renderImage: function (data) {
            if(data.ret == 0){
                this.pop.close();
                if(data.msg){
                    dialog.alert(data.msg);
                }
                return;
            }
            var lis = "",
                pictures = data.pictures,
                len = pictures.length;
            this.$el.find(".all_num").html(len);

            if(len == 1){
                this.renderLargeImage(pictures[0].large);
                return;
            }
            for (var i = 0; i < len; i++) {
                var p = pictures[i];
                lis += '<li class="is-loading" image-large="' + p.large + '"><a>' +
                    '<img src="' + p.small + '"><span class="imgLoad"></span></a></li>';
            }
            var $gCon2 = this.$el.find(".gCon2");

            $gCon2.append(lis);
            $gCon2.find("img").on("load", function () {
                var $img = $(this),
                    $li = $img.closest("li");
                $li.removeClass("is-loading");
            });
            $gCon2.find("li").eq(0).click();
        }
    };
    return slider
});
