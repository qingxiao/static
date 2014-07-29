/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/user',
'module/common/ifollow',
'module/feed_group/groupmanager',
'module/feed_group/group',
'module/feed_group/followgroup/panelview',
'module/feed_group/followgroup/titleview',
'model/feed_group',
'module/card',
'module/common/iletter',
'plugin/jquery.combobox'],
function ($, _, Backbone, UserModel, iFollow, groupManager, feedGroupModule, PanelView, TitleView, feedGroupModel, Card, iLetter) {
    var MyFollows = Backbone.View.extend({
        init: function () {
            iFollow.init();
            iLetter.init();
            if (helper.isLogin()) {
                this.initFeedGroupInfo();
            }
            $.fn.combobox.defaults.TitleView = TitleView;
            $.fn.combobox.defaults.PanelView = PanelView;
            $(".group_operate").combobox({
                onSaveNew: function (title, callback) {
                    var model = new feedGroupModel({
                        title: title
                    });
                    model.createGroup(function (model, data) {
                        feedGroupModule.doAdd(model);
                        callback(model);
                    }, function (model, data) {
                        alert(data["msg"]);
                    });
                },
                onChangeGroups: function (ids, isAutoPush, uid, callback) {
                    var _this = this;
                    var options = $(_this).combobox("options");

                    var model = new feedGroupModel({
                        followingGroupIds: ids,
                        uid: uid,
                        isAutoPush: isAutoPush
                    });
                    model.followGroups(function (model, data) {
                        options.ids = ids;
                        callback();
                    }, function (model, data) {
                        alert(data["msg"]);
                    });
                },
                onBeforeShowGroups: function () {
                    var _this = this;
                    var options = $(_this).combobox("options");

                    feedGroupModule.onLoad("followmini", function (fgroups) {
                        var groups = fgroups.toJSON();
                        feedGroupModule.onRemoveLoad("followmini");
                        options.isLoadGroups = true;
                        groups.unshift({
                            id: -1,
                            title: "必听组"
                        });
                        $(_this).combobox("setDatas", groups);
                    });
                    feedGroupModule.getGroups();

                    return options.isLoadGroups;
                }
            });
            Card.render({
                $container: $("#mainbox")
            });
        },
        /// <summary>
        ///	取得feed分组信息
        /// </summary>
        initFeedGroupInfo: function () {
            var _this = this;
            var $select = $("div.selecter.group-select");
            var $div = $("<div class='selecter'></div>");

            feedGroupModule.onLoad("follow", function (fGroups) {
                var groups = fGroups.toJSON();
                feedGroupModule.onRemoveLoad("follow");
                groups.unshift({
                    id: -1,
                    title: "必听组"
                });
                groups.unshift({
                    id: 0,
                    title: "分组",
                    selected: true
                });
                $div.addClass("fl group-select").selecter({
                    isCreate: true,
                    options: groups,
                    filed: { name: "title", value: "id", selected: $select.attr("val") },
                    customClass: "selecter-s3",
                    onDrop: function () {

                    }
                });
                $select.after($div);
                $select.remove();
                $div.off("change").on("change", function () {
                    var val = $div.selecter("val");
                    if (val) {
                        var href = location.href;

                        href = href.substring(0, href.indexOf("\/"));
                        if (val == "0") {
                            location.href = href + "/#/" + config.CURRENT_USER.uid + "/follow/";
                        } else {
                            location.href = href + "/#/" + config.CURRENT_USER.uid + "/follow?following_group_id=" + val;
                        }
                    }
                });
                $div.find("ul").append('<li><div class="groupmng"><a href="javascript:;">管理分组</a></div></li>');
                $div.find("ul .groupmng").on("click", function () {
                    groupManager.show();
                });
            }, _this);
            feedGroupModule.onAdd("follow", function (model, type) {
                if (type == "add") {
                    $div.selecter("add", { value: model.get("id"), name: model.get("title") }, -1);
                }
                else if (type == "remove") {
                    $div.selecter("del", model.get("id"));
                }
                else if (type == "edit") {
                    $div.selecter("edit", { value: model.get("id"), name: model.get("title") });
                }
            }, this);
            feedGroupModule.getGroups();
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            iFollow.release();
            feedGroupModule.onRemoveAdd("follow");
            feedGroupModule.onRemoveLoad("follow");
            Card.release();
            iLetter.release();
        }
    });

    return new MyFollows({
        model: new UserModel()
    });
});