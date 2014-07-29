/*
 * 喜欢
 */
define(['jquery', 'underscore', 'backbone', 'helper', 'model/sound', '../model', '../base', 'plugin/dialog'], function ($, _, Backbone, helper, SoundModel, Model, View, dialog) {
    var pro = View.prototype, proClone = _.clone(pro);
    _.extend(pro, {
        _$likebtn: null, //喜欢按钮
        _$likeCount: null, //喜欢数字容器
        events: _.extend({
            "click .likeBtn:not(.is-sound-liked)": "like",
            "click .likeBtn.is-sound-liked": "unlike"
        }, proClone.events),
        initialize: function () {
            var $el = this.$el;
            proClone.initialize.apply(this, arguments);
            this._$likebtn = $el.find(".likeBtn");
            this._$likeCount = this._$likebtn.find(".count");
        },
        /*
        * 喜欢
        */
        like: function () {
            var _this = this, soundId = this._soundId, likeCount = 0; //, likeCount = parseInt(this._$likeCount.text(), 10) + 1;
            var soundModel = new SoundModel({
                id: soundId,
                isFavorited: false
            });
            soundModel.query({
                success: function (model) {
                    soundModel = new SoundModel({
                        id: soundId,
                        isFavorited: false
                    });
                    soundModel.like(function () {
                        model.set("isFavorited", false);
                        likeCount = model.get("favoritesCount");
                        likeCount++;
                        model.set("favoritesCount", likeCount);
                        _this._$likebtn.addClass("is-sound-liked");
                        _this._$likeCount.text(likeCount).show();
                        $("[sound_id='" + soundId + "'] .j-sound_favoritesCount").text(likeCount);
                        _this.doShowCartoon(true);
                    }, function (model, response) {
                        dialog.alert(response.msg);
                    });
                }
            });
        },
        /*
        * 取消喜欢
        */
        unlike: function () {
            var _this = this, soundId = this._soundId, likeCount = 0; //, likeCount = parseInt(this._$likeCount.text(), 10) - 1;
            var soundModel = new SoundModel({
                id: soundId,
                isFavorited: true
            });
            soundModel.query({
                success: function (model) {
                    soundModel = new SoundModel({
                        id: soundId,
                        isFavorited: true
                    });
                    soundModel.like(function () {
                        model.set("isFavorited", true);
                        likeCount = model.get("favoritesCount");
                        likeCount--;
                        model.set("favoritesCount", likeCount);
                        _this._$likebtn.removeClass("is-sound-liked");
                        $("[sound_id='" + soundId + "'] .j-sound_favoritesCount").text(likeCount);
                        _this.doShowCartoon(false);
                    }, function (model, response) {
                        dialog.alert(response.msg);
                    });
                }
            });
        },
        /*
        * 喜欢操作后的动画效果
        */
        doShowCartoon: function (isLike) {
            var $div = $('<div><span></span></div>');
            var pos = this._$likebtn.offset();

            $div.addClass("likeBtnDynamic");
            if (isLike) {
                $div.addClass("liked");
            }
            $div.css({
                left: pos.left,
                top: pos.top
            });
            $(document.body).append($div);
            $div.animate({
                top: pos.top - 25,
                opacity: 'toggle'
            }, 1500, function () {
                $div.remove();
            });

        }
    });
    return View;
});