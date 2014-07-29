/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-19
 * Time: 上午10:26
 * To change this template use File | Settings | File Templates.
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'model/comment',
    'model/forward',
    'plugin/count_char',
    'plugin/face',
    'module/share',
    'plugin/dialog',
    'module/common/iattextbox'],
    function ($, _, Backbone, CommentModel, ForwardModel, pluginCountChar, pluginFace, ShareView, dialog, iAttextbox) {
        var CommentView = Backbone.View.extend({

            initialize: function (options) {
                this.trackId = options.trackId;
                this.parentId = options.parentId || "";
                this.second = options.second || "";
                this.success = options.success || $.noop;
                this.error = options.error || $.noop;
                this.isForward = options.isForward;
                if (this.isForward) {
                    this.forwardModel = new ForwardModel();
                } else {
                    this.commentModel = new CommentModel();
                }
                this.beforeComment = options.beforeComment || $.noop;
                var $el = options.$el;
                this.$el = $el;
                this.$input = options.$input || $el.find(".commentBox_inputBox input[type=text]");
                this.$submitBtn = options.$submitBtn || $el.find(".submitBtn");
                this.$charCount = options.$charCount || this.$el.find(".charCount");
                this.$closeBtn = $el.find(".closeBtn");
                this.initCount();
                this.initFace();
                this.initShare();
                this.bindEvents();
            },
            bindEvents: function () {
                var $submitBtn = this.$submitBtn,
                    _this = this;
                $submitBtn.on("click", function () {
                    $submitBtn.addClass("is-loading");
                    _this.createComment(function(){
                        $submitBtn.removeClass("is-loading");
                    });
                });
                this.$closeBtn.on("click", function () {
                    _this.$el.stop().slideToggle();
                });
                this.$input.on({
                    count_ok: function () {
                        _this.$el.removeClass("is-error");
                    },
                    count_pass: function () {
                        _this.$el.addClass("is-error");
                    }
                });
                iAttextbox.bind(this.$input);
            },
            initCount: function () {
                var $charCount = this.$charCount;
                if (!$charCount.size()) {
                    return;
                }
                var count = 140;
                if (this.isForward) {
                    count = 30;
                }
                pluginCountChar(this.$input, $charCount, count, {text: "还剩<em>{count}</em>字", passText: "超出<em>{count}</em>字"});
            },
            initFace: function () {
                var $faceBtn = this.$el.find(".faceBtn");
                if (!$faceBtn.size()) {
                    return;
                }
                pluginFace.init($faceBtn, this.$input);
            },
            initShare: function () {
                var shareView = new ShareView({
                    $el: this.$el
                });
                this.shareView = shareView;
            },
            createForward: function (callback) {
                callback = callback || $.noop;
                var _this = this,
                    content = $.trim(this.$input.val());

                var data = {
                    content: content,
                    trackId: _this.trackId
                };
                var extData = this.beforeComment(data);

                this.shareView.getShareData(function (shareData) {
                    data = $.extend(data, extData, shareData);
                    _this.forwardModel.set(data);
                    var msg = _this.forwardModel.check();
                    if (msg) {
                        dialog.alert(msg);
                        _this._isAjax = false;
                        callback();
                        return;
                    }
                    _this.forwardModel.create(function (model, response) {
                        _this.commentSuccess(model, response);
                        dialog.success("转采成功");
                        _this._isAjax = false;
                        callback();
                    }, function (model, xhr, options) {
                        _this.commentError(model, xhr, options);
                        _this._isAjax = false;
                        callback();
                    });
                });


            },
            createComment: function (callback) {
                callback = callback || $.noop;
                if(this._isAjax){
                    return;
                }
                this._isAjax = true;
                if (this.isForward) {
                    this.createForward(callback);
                    return;
                }
                var _this = this,
                    content = $.trim(this.$input.val());

                if (!content) {
                    dialog.alert("评论不能为空");
                    this._isAjax = false;
                    callback();
                    return;
                }

                var data = {
                    content: content,
                    trackId: _this.trackId,
                    parentId: _this.parentId,
                    second:_this.second
                };
                var extData = this.beforeComment(data);

                this.shareView.getShareData(function (shareData) {
                    data = $.extend(data, extData, shareData);
                    _this.commentModel.set(data);
                    var msg = _this.commentModel.check();
                    if (msg) {
                        dialog.alert(msg);
                        _this._isAjax = false;
                        callback();
                        return;
                    }

                    _this.commentModel.create(function (model, response) {
                        _this.commentSuccess(model, response);
                        var msg = "评论成功";
                        if(data.parentId){
                            msg = "回复成功";
                        }
                        dialog.success(msg);
                        callback();
                    }, function (model, xhr, options) {
                        _this.commentError(model, xhr, options);
                        callback();
                    });
                }, function(){
                    _this._isAjax = false;
                    callback();
                });

            },
            commentSuccess: function (model, response) {
                this._isAjax = false;
                this.$input.val("");
                this.$input.blur();
                this.success(response);
            },
            commentError: function (model, xhr, options) {

                this._isAjax = false;
                this.error(xhr);
                if(xhr.status == 400){
                    return;
                }
                dialog.alert(xhr.msg || "服务器繁忙,请稍后再试!");

            },

            release: function () {
                var $el = this.$el;
                $el.off();
                $el.empty();
            }
        });

        return  CommentView;
    });