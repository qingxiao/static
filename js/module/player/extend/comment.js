/*
 * 评论和转采
 */
define(['jquery',
    'underscore',
    'backbone',
    'helper',
    'model/sound',
    '../model',
    '../base',
    "module/comment_box",
    "module/card",
    "module/default_image",
    "module/dialogs/forward",
    'model/comment',
    'plugin/dialog'],
    function ($, _, Backbone, helper, SoundModel, Model, View, CommentBoxModel, card, defaultImage, forwardDialog, CommentModel, dialog) {



        var pro = View.prototype, proClone = _.clone(pro);

        _.extend(pro, {
            _$likebtn: null, //喜欢按钮
            _$likeCount: null, //喜欢数字容器
            events: _.extend({
                "click .commentBtn": "showComment",
                "click .forwardBtn": "showForward",
                "click .replyBtn": "showReply"

            }, proClone.events),
            initialize: function () {
                var $el = this.$el;

                proClone.initialize.apply(this, arguments);
                this.track_id = $el.attr("sound_id");
                this._$commentbtn = $el.find(".commentBtn");
                this._$commentCount = this._$commentbtn.find(".count");
                this._$commentBoxEntry = this.$el.find(".comment_box_entry");

                this._$forwardbtn = $el.find(".forwardBtn");
                this._$forwardCount = this._$forwardbtn.find(".count");
                this._$forwardBoxEntry = this.$el.find(".relay_box_entry");

                this._$replybtn = $el.find(".replyBtn");
                this._$replyBoxEntry = this.$el.find(".reply_box_entry");

            },
            getTemplate:function(){
                //评论框模版
                if(this._commentBoxStr){
                    return;
                }
                var temp_el = document.getElementById("tpl_comment_box");
                var comment_box_template,
                    template_data = {};
                if (temp_el) {
                    comment_box_template = _.template(temp_el.innerHTML);
                    template_data = {
                        comment: {
                            title: "评论声音",
                            btnText: "评论",
                            shareType: "comment"
                        },
                        forward: {
                            title: "转采声音",
                            btnText: "转采",
                            shareType: "relay"
                        },
                        reply: {
                            title: "回复",
                            btnText: "评论",
                            shareType: "comment"
                        }
                    };
                    this._commentBoxStr = comment_box_template(template_data.comment);
                    this._forwardBoxStr = comment_box_template(template_data.forward);
                    this._replyBoxStr = comment_box_template(template_data.reply);
                }
            },
            getTrackId:function(){
                return this.$el.attr("sound_id");
            },
            showCommonBox:function(e, type, $boxEntry, boxStr, callback){
                var $btn = $(e.target),
                    dataOps = $btn.attr("data-options"),
                    data =  dataOps ? $.parseJSON(dataOps) : {};
                callback = callback || $.noop;

                var isForward = type == "forward",
                    isReply = type == "reply",
                    isComment = type == "comment"

                var track_id = this.getTrackId(),
                    $commentBox,
                    _this = this;

                if ($boxEntry.attr("data-comment-init")) {
                    $commentBox = $boxEntry.find(".commentBox");
                    $commentBox.stop().slideToggle(function(){
                        _this.$el.trigger("onExpand");
                    });
                    return;
                }

                $boxEntry.attr("data-comment-init", true);
                $boxEntry.html(boxStr);
                $commentBox = $boxEntry.find(".commentBox");

                //点击input切换textarea
                var $commentBox_inputBox = $commentBox.find(".commentBox_inputBox");
                var $holderInput = $commentBox_inputBox.find("input"),
                    $textarea = $commentBox_inputBox.find("textarea");

                $holderInput.on("focus", function () {
                    $commentBox_inputBox.addClass("is-onEdit focus");
                    $textarea.focus();
                    return false;
                });
                $textarea.on({
                    blur: function () {
                        $commentBox_inputBox.removeClass("focus");
                        if (!$.trim($textarea.val())) {
                            $commentBox_inputBox.removeClass("is-onEdit");
                        }
                    },
                    focus: function () {
                        $commentBox_inputBox.addClass("is-onEdit focus");
                        $commentBox.height("auto");
                        if (!$textarea.val() && data.c_nickname) {
                            $textarea.val("回复@" + data.c_nickname + ":");
                        }
                    }
                });

                //删除评论
                $commentBox.on("click", ".comment_delete", function () {
                    var $a = $(this),
                        data = $.parseJSON($a.attr("data-options")),
                        $li = $a.closest(".listItem");
                    _this.delComment(data, function(md, res){
                        $li.slideUp();
                    },function(md, res){
                        if(res.msg){
                            dialog.alert(res.msg);
                        }
                    });
                });
                new CommentBoxModel({
                    $el: $commentBox,
                    trackId: track_id,
                    parentId: data.c_id || "",
                    second:data.c_second,
                    $input: $textarea,
                    isForward: isForward,
                    success: function (response) {
                        var $entry = $boxEntry;
                        if(isReply){
                            $entry = _this._$commentBoxEntry;
                        }
                        _this.getCommentList(track_id, $entry, isForward, function () {
                            $commentBox_inputBox.removeClass("is-onEdit");
                        });
                        callback(response);
                    }
                });
                if(isReply){
                    $commentBox.stop().slideToggle(function(){
                        _this.$el.trigger("onExpand");
                    });
                    return;
                }
                this.getCommentList(track_id, $boxEntry, isForward, function () {
                    $commentBox.stop().slideToggle(function(){
                        _this.$el.trigger("onExpand");
                    });
                  //  $commentBox_inputBox.removeClass("is-onEdit");
                });
            },
            /*
             * 显示评论框
             */
            showComment: function (e) {
                this.getTemplate();
                var track_id = this.getTrackId();
                if(this._$commentBoxEntry.size()==0){
                    forwardDialog.open(track_id, true, function (response) {
                        var $count =  $("[sound_id=" + track_id + "] .commentBtn .count"),
                            count =    response.track_comments_count || $count.text()*1+1;
                        $count.text(count);
                    });
                    return;
                }
                this._$forwardBoxEntry.find(".commentBox").stop().slideUp();
                var $count = this._$commentCount;
                this.showCommonBox(e, "comment", this._$commentBoxEntry, this._commentBoxStr, function(response){
                    $count.text(response.track_comments_count || $count.text()*1+1);
                });
            },
            delComment:function(data, s, e){
                var commentModel  = new CommentModel({id:data.comment_id }),
                    _this = this;
                commentModel.set({
                    trackId:_this.$el.attr("sound_id")
                });
                commentModel.del(s, e);
            },
            getCommentList: function (track_id, $boxEntry, isForward, callback) {
                callback = callback || $.noop;
                var $commentBoxList = $boxEntry.find(".commentBox_commentList"),
                    list_url = isForward ? "/sounds/relay_list_template" : "/sounds/comment_list_template";

                if($commentBoxList.size() == 0){
                    callback();
                    return;
                }
                $.get(list_url, {id: track_id}, function (result) {
                    $commentBoxList.empty().html(result);
                    card.render({$container: $commentBoxList});
                    defaultImage.render({$container: $commentBoxList});
                    callback();
                });
            },
            /*
             * 显示转发
             */
            showForward: function (e) {
                //todo
                this.getTemplate();
                var track_id = this.getTrackId();
                if (this._$forwardBoxEntry.size() == 0) {
                    forwardDialog.open(track_id, false, function (response) {
                        var $count =   $("[sound_id=" + track_id + "] .forwardBtn .count"),
                            count = response.track_shares_count || $count.text()*1+1;
                        $count.text(count);
                    });
                    return;
                }
                this._$commentBoxEntry.find(".commentBox").stop().slideUp();
                var $count = this._$forwardCount;
                this.showCommonBox(e, "forward", this._$forwardBoxEntry, this._forwardBoxStr, function(response){
                    $count.text(response.track_shares_count || $count.text()*1+1);
                });
            },
            showReply:function(e){
                this.getTemplate();
                var $btn = $(e.target),
                    $parent = $btn.closest(".comment"),
                    $boxEnter;
                if ($parent.size() > 0) {
                } else {
                    $parent = $btn.closest("li");
                }
                if($parent.size() == 0){
                    return;
                }
                $boxEnter = $parent.find(".right").find(".reply_box_entry");
                this.showCommonBox(e,"reply", $boxEnter, this._replyBoxStr);
            }
        });
        return View;
    });