define([
'jquery',
'underscore',
'backbone',
'json2',
'model/user',
'module/feed_group/followmanager',
'plugin/dialog',
'plugin/jquery.parser'],
function ($, _, Backbone, JSON, UserModel, followManager, dialog) {
    var msg = {
        follow: "关注",
        follow_loading: "关注中",
        already_follow: "已关注",
        already_follow_loading: "取消中",
        follow_eachother: "相互关注"
    };
    var iFollowView = Backbone.View.extend({
        init: function () {
            this.release();
            $(".followBtn[data-options]").on("click", [this], this.doFollow);
            $(".addBtn[data-options],.addBtn2[data-options]").on("click", [this], this.doFollow);
            $(".personal_operate[data-options]").on("click", [this], this.doRemoveFans);
        },
        doBindOne: function ($el) {
            $el.on("click", [this], this.doFollow);
        },
        /// <summary>
        /// 移除粉丝
        /// </summary>
        /// <param name="e">元素</param>
        doRemoveFans: function (e) {
            var $this = $(this);
            var data_options = $.extend({}, $.parser.parseOptions(this, [{ uid: "number"}]));
            var view = e.data[0];

            if (view.model && data_options.uid && data_options.lock !== true) {
                data_options["lock"] = true;
                helper.doChangeOptions($this, data_options);
                view.model.set("id", data_options.uid);
                view.model.doRemoveFans(function (model, data, options) {
                    $this.closest(".item").fadeOut();
                    data_options["lock"] = undefined;
                    helper.doChangeOptions($this, data_options);
                }, function (model, data, options) {
                    alert(data.msg);
                    data_options["lock"] = undefined;
                    helper.doChangeOptions($this, data_options);
                });
            }
        },
        /// <summary>
        /// 关注方法
        /// </summary>
        /// <param name="e">元素</param>
        doFollow: function (e) {
            var $this = $(this);
            var data_options = $.extend({}, $.parser.parseOptions(this, [
            {
                uid: "number", //人id
                is_follow: "boolean", //是否关注
                be_followed: "boolean", //是否关注
                remove: "string", //移除元素的selector
                show: "string", //需要显示元素的selector
                remove_state: "boolean", //移除是关注的状态
                is_from_cache: "boolean"//是否需要更新本地缓存
            }]));
            var view = e.data[0];

            if (view.model && data_options.uid && data_options.lock !== true) {
                var $span = $this.find("span.default");

                data_options["lock"] = true;
                helper.doChangeOptions($this, data_options);
                data_options.is_follow = !data_options.is_follow;
                view.model.set("id", data_options.uid);
                view.model.set("isNotFollowing", data_options.is_follow);

                if (data_options.is_follow) {
                    $this.addClass("loading").attr("otext", $span.text());
                    $span.text(msg.follow_loading);
                } else {
                    $this.addClass("canceling").attr("otext", $span.text());
                    $span.text(msg.already_follow_loading);
                    $this.removeClass("both");
                }
                view.model.doFollow(function (model, data, options) {
                    data_options["lock"] = undefined;
                    if (data.res.be_followed) {
                        data_options["be_followed"] = data.res.be_followed;
                    }
                    helper.doChangeOptions($this, data_options);
                    //更新缓存
                    if (data_options.is_from_cache === true) {
                        view.model.query({
                            success: function (model) {
                                model.set("isNotFollowing", !data_options.is_follow);
                                model.set("beFollowed", data_options.be_followed);
                            }
                        });
                    }
                    //计算关注的人数量
                    var $count = $(".follows_count"), count = 0;
                    if ($count.size()) {
                        count = $($count[0]).text() * 1;
                        if (data_options.is_follow) {
                            count++;
                        } else {
                            count--;
                        }
                        $count.text(count);
                    }
                    if (data_options.is_follow) {
                        $(".setGroups").show();
                        setTimeout(function () {
                            followManager.show($.extend({}, data_options));
                            $this.trigger("mouseleave");
                        }, 60);
                    } else {
                        $(".setGroups").hide();
                    }
                    //是否需要移除元素
                    if (data_options.remove && data_options.remove_state === data_options.is_follow) {
                        var item = $this.closest(data_options.remove);
                        if (data_options.show) {
                            item.siblings(data_options.show).fadeIn();
                        }
                        item.fadeOut(100, function () {
                            item.remove();
                        });
                        return;
                    }
                    //更改状态
                    if (!data_options.is_follow) {
                        $this.removeClass("canceling").removeClass("already");
                        if (data_options.be_followed) {
                            $this.removeClass("both");
                        }
                        $span.text(msg.follow);
                    } else {
                        if (data_options.be_followed) {
                            $this.removeClass("loading").addClass("already").addClass("both");
                            $span.text(msg.follow_eachother);
                        } else {
                            $this.removeClass("loading").addClass("already");
                            $span.text(msg.already_follow);
                        }
                    }
                    //查找右侧元素，将其移除
                    $(".personPanelBar3List li[recommend_uid=" + data_options.uid + "]").fadeOut();
                }, function (model, data, options) {
                    data_options["lock"] = undefined;
                    helper.doChangeOptions($this, data_options);
                    $this.removeClass("loading").removeClass("canceling");
                    $span.text($this.attr("otext"));
                    if (data_options.be_followed && data_options.is_follow) {
                        $this.addClass("both");
                    }
                    if (data) {
                        dialog.alert(data.msg);
                    }
                });
            }

            return false;
        },
        release: function () {
            $(".followBtn[data-options]").off("click");
            $(".addBtn[data-options],.addBtn2[data-options]").off("click");
            $(".personal_operate[data-options]").off("click");
        }
    });

    return new iFollowView({
        model: new UserModel()
    });
});