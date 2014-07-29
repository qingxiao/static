/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-7
 * Time: 下午4:37
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', 'helper', 'module/player/player', 'module/comment_box', 'module/common/ireport', 'model/comment',
    'plugin/dialog', 'module/dialogs/share2friend', 'module/common/sound2public'],
    function ($, PageBase, helper, player, CommentBoxModel, ireport, CommentModel, dialog, share2friend) {

        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.$el = $(".mainbox_wrapper");
                this.$soundBox = this.$el.find(".detail_soundBox2");
                this.track_id = this.$soundBox.attr("sound_id");
                this.relayBoxHtml = $("#reply_box_template").html();
                this.initPlayer();
                this.initCommentBox();
                this.initForwardBox();
                this.bindEvents();
                if (window.location.href.indexOf("relay=true") > 0) {
                    this.getForwardList();
                } else {
                    this.getCommentList();
                }
                ireport.init();
                if(helper.isLogin()){
                    this.initAjaxContent();
                }
            },
            initAjaxContent: function () {
                //右侧
                var id = this.track_id,
                    $el = this.$el,
                    url_pre = "/sounds/" + id + "/",
                    maybe_like_list = url_pre + "maybe_like_list",
                    right = url_pre + "right",
                    rich_intro = url_pre + "rich_intro",
                    $like_list = $el.find(".recommendSound_body"),
                    $rich_intro = $el.find(".rich_intro"),
                    $right = $el.find(".mainbox_right"),
                    _this = this;
                $rich_intro.load(rich_intro);
                $like_list.addClass("loadingMore").load(maybe_like_list, function () {
                    $like_list.removeClass('loadingMore');
                });
                $right.addClass("loadingMore").load(right, function () {
                    $right.removeClass("loadingMore");
                    _this.afterRender();
                });

            },
            initPlayer: function () {
                var _this = this;
                player.render({
                    $container: _this.$soundBox
                });
            },
            //公用评论框init方法
            initBox: function ($commentBox, isForward, callback) {
                var _this = this,
                    $commentBox_inputBox = $commentBox.find(".commentBox_inputBox"),
                    $textarea = $commentBox.find(".comment_input textarea"),
                    track_id = this.track_id;
                $textarea.on({
                    blur: function () {
                        $commentBox_inputBox.removeClass("focus");
                    },
                    focus: function () {
                        $commentBox_inputBox.addClass("focus");
                    }
                });
                new CommentBoxModel({
                    $el: $commentBox,
                    trackId: track_id,
                    $input: $textarea,
                    isForward: isForward,
                    success: function (response) {
                        callback(response);
                    }
                });
            },
            initCommentBox: function () {
                var _this = this,
                    $commentBox = _this.$el.find(".commentSection_body  .commentSend .commentBox");
                this.initBox($commentBox, false, function (response) {
                    _this.getCommentList();
                    _this.$el.find(".commentBtn").html("评论(" + (response.track_comments_count || 0) + ")");
                });

            },
            initForwardBox: function () {
                var _this = this,
                    $commentBox = _this.$el.find(".relaySection_body .commentSend .commentBox");
                this.initBox($commentBox, true, function (response) {
                    _this.getForwardList();
                    _this.$el.find(".forwordBtn").html("转采(" + (response.track_shares_count || 0) + ")");
                });
            },
            getForwardList: function (page) {
                page = page || 1;
                var data = {
                    id: this.track_id,
                    page: page
                };
                var list_url = "/sounds/" + data.id + "/relay_list",
                    _this = this,
                    $relay_list_wrap = $("#relay_list_wrap");
                $relay_list_wrap.empty().addClass("loadingMore");
              //todo 放model里 
                $.get(list_url, data, function (result) {
                    $relay_list_wrap.removeClass("loadingMore");
                    $relay_list_wrap.html(result);
                });
            },
            getCommentList: function (page) {
                page = page || 1;
                var data = {
                    id: this.track_id,
                    page: page
                };
                var list_url = "/sounds/" + data.id + "/comment_list",
                    _this = this,
                    $comment_list_wrap = $("#comment_list_wrap");
                $comment_list_wrap.empty().addClass("loadingMore");
                //todo 放model里 
                $.get(list_url, data, function (result) {
                    $comment_list_wrap.removeClass("loadingMore");
                    $comment_list_wrap.html(result);
                    ireport.init();
                });
            },
            getListAfter: function () {
                helper.scrollTo(this.$el.find(".commentSection"), 0);
            },
            release: function () {
                this.callParent("release");
                this.unbindEvents();
                ireport.release();
            },
            bindEvents: function () {
                var _this = this,
                    $el = this.$el;
                //分页
                $el.on("click", ".commentSection_body .pagingBar_wrapper [data-page]", function () {
                    var page = $(this).attr('data-page');
                    _this.getCommentList(page);
                    _this.getListAfter();
                });
                $el.on("click", ".relaySection_body .pagingBar_wrapper [data-page]", function () {
                    var page = $(this).attr('data-page');
                    _this.getForwardList(page);
                    _this.getListAfter();
                });
                //评论  转采 切换
                var $commentSection_body = $el.find(".commentSection_body"),
                    $relaySection_body = $el.find(".relaySection_body");
                $el.on("click", ".commentSection .tagTab .tab_item", function () {
                    var $item = $(this),
                        idx = $item.index();
                    if ($item.hasClass("on")) {
                        return;
                    }
                    $item.parent().find(".on").removeClass("on");
                    $item.addClass("on");
                    if (idx == 0) {
                        $commentSection_body.show();
                        $relaySection_body.hide();
                        _this.getCommentList();
                    } else {
                        $commentSection_body.hide();
                        $relaySection_body.show();
                        _this.getForwardList();
                    }

                });
                //删除
                $el.on("click", ".commentSection .delBtn", function () {
                    var $btn = $(this),
                        $comment = $btn.closest(".comment"),
                        data = $.parseJSON($btn.attr("data-options"));
                    if ($comment.size() == 0) {
                        $comment = $btn.closest(".listItem");
                    }
                    _this.delComment(data, function (md, res) {
                        $comment.slideUp();
                    }, function (md, res) {
                        dialog.alert(res.msg);
                    });

                });
                //回复 按钮
                $el.on("click", ".commentSection .replyBtn", function () {
                    var $btn = $(this),
                        $parent = $btn.closest(".comment"),
                        $boxEnter;
                    if ($parent.size() > 0) {
                        $boxEnter = $parent.children(".reply_box_entry");
                    } else {
                        $parent = $btn.closest(".comment2");
                        if ($parent.size() > 0) {
                            $boxEnter = $parent.children(".right").children(".reply_box_entry");
                        }
                    }
                    _this.createRelayBox($boxEnter, $.parseJSON($btn.attr("data-options")));
                });
                //推荐声音  换一组
                $el.on("click", ".recommendSound_head a", function () {
                    _this.changeRecommend();
                });
                //简介展开收起
                var $mid_intro = $el.find(".mid_intro"),
                    $rich_intro = $el.find(".rich_intro");
                $el.on("click", ".mid_intro .arrow", function () {
                    $mid_intro.stop().slideUp();
                    $rich_intro.stop().slideDown();
                });
                $el.on("click", ".rich_intro .arrow", function () {
                    $mid_intro.stop().slideDown();
                    $rich_intro.stop().slideUp();
                });
                //富文本 A标签跳转
                $el.on("click", ".rich_intro a", function () {
                    var host = this.host,
                        href = this.href;
                    if (host) {
                        var win_host = window.location.host;
                        if (host == win_host) {
                            window.location.href = href;
                        } else {
                            window.open(href);
                        }
                    }
                    return false;
                });

                $el.on("click", ".shareLink", function(){
                    var $btn = $(this),
                        id = $btn.attr("track_id"),
                        uid = $btn.attr("track_uid");
                    share2friend.open(id, uid);

                });

            },
            delComment: function (data, s, e) {
                var commentModel = new CommentModel({id: data.comment_id });
                commentModel.set({
                    trackId: data.track_id
                });
                commentModel.del(s, e);
            },
            changeRecommend: function () {
                var $recommendSound_body = this.$el.find(".recommendSound_body"),
                    $items = $recommendSound_body.children();
                $items.hide();
                var len = $items.length;
                if (len <= 5) {
                    $items.show();
                    return;
                }
                var random_arr = this.getRandomArr(len, 5);
                for (var i = 0; i < random_arr.length; i++) {
                    $items.eq(random_arr[i]).show();
                }
            },
            getRandomArr: function (maxLen, len) {
                var arr = [];
                while (maxLen--) {
                    arr[maxLen] = maxLen;
                }
                var return_arr = [];
                while (len--) {
                    var num = this.getRandom(arr.length);
                    return_arr.push(arr[num]);
                    arr.splice(num, 1);
                }
                return return_arr;
            },
            getRandom: function (max) {
                return parseInt(Math.random() * max);
            },
            createRelayBox: function ($boxEnter, data) {
                if ($boxEnter.size() < 1) {
                    return;
                }
                if ($boxEnter.attr("data-inited")) {
                    $boxEnter.find(".commentBox").stop().slideToggle();
                    return;
                }
                $boxEnter.html(this.relayBoxHtml);
                var _this = this,
                    $commentBox = $boxEnter.find(".commentBox"),
                    $textarea = $commentBox.find('textarea');
                $commentBox.hide().stop().slideToggle();

                //点击input切换textarea
                var $commentBox_inputBox = $commentBox.find(".commentBox_inputBox");
                var $holderInput = $commentBox_inputBox.find("input");

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
                        if (!$textarea.val()) {
                            $textarea.val("回复@" + data.c_nickname + ":");
                        }
                    }
                });

                new CommentBoxModel({
                    $el: $commentBox,
                    trackId: _this.track_id,
                    parentId: data.c_id,
                    second:data.c_second,
                    $input: $textarea,
                    isForward: false,
                    success: function (response) {
                        _this.getCommentList();
                        _this.$el.find(".commentBtn").html("评论(" + (response.track_comments_count || 0) + ")");
                    }
                });
                $boxEnter.attr("data-inited", true);

            },
            unbindEvents: function () {
                this.$el.off();
            }
        });
        return new Page();
    });