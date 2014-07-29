/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-21
 * Time: 上午11:17
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', "page/page_base", 'module/comment_box',"plugin/dialog"],
    function ($, PageBase, CommentBoxModel, dialog) {
        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.$el = $("#mainbox");
                this.bindEvents();
            },
            bindEvents: function () {
                var _this = this;
                this.$el.on("click", ".msg_notice_list .replyBtn", function () {
                    var $btn = $(this);
                    _this.replyBox($btn);
                });
            },
            replyBox: function ($btn) {
                var data = $.parseJSON($btn.attr('data-options'));
                var $item = $btn.closest(".msg_notice_item"),
                    $entry = $item.find(".reply_box_entry");
                if ($entry.children().size() == 0) {
                    $entry.hide().html(this.getReplyBoxHtml());
                    var $commentBox = $entry.find(".commentBox"),
                        $textarea = $commentBox.find("textarea"),
                        $commentBox_inputBox = $commentBox.find(".commentBox_inputBox");
                    $entry.slideDown();
                    var $holderInput =  $commentBox_inputBox.find("input");

                    $holderInput.on("focus", function(){
                        $commentBox_inputBox.addClass("is-onEdit focus");
                        $textarea.focus();
                        return false;
                    });
                    $textarea.on({
                        blur: function(){
                            $commentBox_inputBox.removeClass("focus");
                            if(!$.trim($textarea.val())){
                                $commentBox_inputBox.removeClass("is-onEdit");
                            }
                        },
                        focus:function(){
                            $commentBox_inputBox.addClass("is-onEdit focus");
                            $commentBox.height("auto");
                            if(!$textarea.val()){
                                $textarea.val("回复@"+ data.c_nickname+":");
                            }
                        }
                    });
                    new CommentBoxModel({
                        $el: $commentBox,
                        parentId: data.c_id,
                        trackId: data.t_id,
                        second:data.c_second,
                        $input: $textarea,
                        isForward: false,
                        success: function (response) {
                            dialog.success("回复成功");
                        }
                    });
                } else {
                    $entry.slideToggle();
                }
            },
            getReplyBoxHtml: function () {
                if (!this.replyBoxHtml) {
                    this.replyBoxHtml = $("#reply_box_template").html();
                }
                return this.replyBoxHtml;
            },
            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });