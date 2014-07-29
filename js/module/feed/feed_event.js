define([
'jquery',
'underscore',
'backbone',
'module/feed/feed',
'module/feed_group/group',
'module/common/ifeed',
'module/common/ifollow',
'module/common/ireport',
'module/player/player',
'module/card',
'module/common',
'plugin/jquery.selecter'],
function ($, _, Backbone, feedView, feedGroupModule, ifeed, ifollow, ireport, player, card, common) {
    var feed = {
        /// <summary>
        /// 滚动事件的id
        /// </summary>
        feedTimeID: 0,
        /// <summary>
        /// 读取未读数的id
        /// </summary>
        queryNewIntervalId: 0,
        /// <summary>
        /// feed的位置，滚动到此位置，取更多的feed
        /// </summary>
        feedLastOffset: { top: 0 },
        /// <summary>
        /// 读取未读数间隔
        /// </summary>
        queryNoRead: 30000,
        /// <summary>
        /// 设置列表的播放列表
        /// </summary>
        /// <param name="listItem">dom的key</param>
        /// <param name="groupIds">列表的ids</param>
        initList: function (listItem, groupIds) {
            var $soundList = $("[listitem='" + listItem + "']");
            var oldSoundIds = $soundList.attr("sound_ids");

            if (!oldSoundIds) {
                $soundList.attr("sound_ids", groupIds);
            } else {
                groupIds = oldSoundIds + ',' + groupIds;
                $soundList.attr("sound_ids", groupIds);
            }
            if (listItem == "all_play_list") {
                player.soundIds(groupIds.split(','));
            }
        },
        /// <summary>
        /// 分页
        /// </summary>
        changeFeedPage: function () {
            var $e = $(this),
			    $p = $e.parents(".feed_paging"),
			    //$on = $p.find("a.on"),
			    pageOn = feedView.model.get("page"),
                page = 0;
            if ($e.attr("rel") == "prev") {
                page = pageOn - 1;
            } else if ($e.attr("rel") == "next") {
                page = pageOn + 1;
            } else {
                page = parseInt($e.text());
            }
            $p.empty();
            $(".backToTop").click();
            feedView.model.set("page", page);

            return false;
        },
        /// <summary>
        /// 改变feed类型
        /// </summary>
        changeFeedType: function () {
            if (!$(this).hasClass("on")) {
                $("[feedtype]").removeClass("on");
                $(this).addClass("on");
                $(".feedMoreMessageBox").hide();
                if (feedView.model.get("feedType") == "event") {
                    $("[listitem='all_play_list']").attr("sound_ids", '');
                    $(".feedTab .tab_title").text("声音流");
                } else {
                    $(".feedTab .tab_title").text("新鲜事");
                }
                feedView.model.set("feedType", $(this).attr("feedtype"));
            }
            return false;
        },
        /// <summary>
        /// 绑定事件
        /// </summary>
        bind: function () {
            var _this = this;
            var feedid = $(".feedList .listItem");
            var feedidlast = feedid.last();
            var feedsize = feedid.size();

            ifeed.init();
            ifollow.init();
            ireport.init();
            //展开更多事件
            feedid.find(".moreBtn").off().on("click", function () {
                var $this = $(this), $listItem = $this.closest(".listItem");

                $listItem.find(".gapB.hidden").slideToggle();
                $listItem.find(".commentBubbleList .listItem.hidden").slideToggle();
                $listItem.find(".personPanelBar2.hidden").slideToggle();

                $this.toggleClass("expand").toggleClass("unexpand");
                return false;
            });
            //回复按钮
            /*feedid.find(".replyBtn").off().on("click", function () {
            $(this).closest(".commentBubble").toggleClass("is-comment-onReplay");
            $(this).closest(".listItem").find(".commentBox").slideToggle();
            return false;
            });*/
            //分页事件
            $(".pagingBar").find("a:not(.on)").off().on("click", _this.changeFeedPage);
            //计算最后第三个feed的位置
            if (feedsize > 3) {
                feedidlast = $(feedid[feedsize - 3]);
            }
            if (feedsize) {
                feed.feedLastOffset = feedidlast.offset();
            } else {
                feed.feedLastOffset = { top: 10 };
            }
        },
        /// <summary>
        ///	取得feed分组信息
        /// </summary>
        initFeedGroupInfo: function () {
            var _this = this;

            feedGroupModule.onLoad("feed_event", function (fGroups) {
                var $select = $(".feedTab .selecter");
                var $div = $("<div class='selecter'></div>");
                var groups = fGroups.toJSON();

                groups.unshift({
                    id: -1,
                    title: "必听组"
                });
                groups.unshift({
                    id: 0,
                    title: "全部",
                    selected: true
                });
                $div.addClass("fl group-select").selecter({
                    isCreate: true,
                    options: groups,
                    filed: { name: "title", value: "id", selected: 0 },
                    customClass: "selecter-s3"
                });
                $select.after($div);
                $select.remove();
                $div.off("change").on("change", function () {
                    feedView.model.set("groupID", $div.selecter("val"));
                });
            }, _this);
            feedGroupModule.onAdd("feed_event", function (model, type) {
                if (type == "add") {
                    $(".feedTab .selecter").selecter("add", { value: model.get("id"), name: model.get("title") });
                }
            }, _this);

            feedGroupModule.getGroups();
        },
        /// <summary>
        ///	改变groupid事件
        /// </summary>
        doChangeGroup: function () {
            feedView.model.set("groupID", $(this).val());
        },
        /// <summary>
        /// 更多feed
        /// </summary>
        /// <param name="options">数据集</param>
        setMore: function (options) {
            feedView.model.set(options);
            feedView.doCalcMore();
            feed.bind();
            player.init();
            card.render({
                $container: $("#mainbox")
            });
        },
        /// <summary>
        /// 初始化
        /// </summary>
        init: function (data) {
            var _this = this;

            $("ul.feedList").after('<div class="loadingMore hidden"></div>');
            ifeed.model = feedView.model;
            $(".feedMoreMessageBox").hide();
            feedView.model.set(data);
            _this.bind();
            player.init();
            _this.initFeedGroupInfo();
            //feed类型更换事件
            $("[feedtype]").off().on("click", _this.changeFeedType);
            //feed事件
            feedView.modelLocal.set("onAppendMore", _this.onAppendMore);
            feedView.modelLocal.set("onReload", _this.onReload);
            feedView.modelLocal.set("appendMoreLocked", false);
            //滚动条事件
            $(window).on("scroll", _this.onScrollToBottom);
            //feed未读数
            _this.queryNewIntervalId = setInterval(function () {
                feedView.modelRead.getNoRead(_this.setNoRead);
            }, _this.queryNoRead);
        },
        /// <summary>
        /// 设置列表的播放列表
        /// </summary>
        /// <param name="model">feed的model</param>
        /// <param name="data">数据集</param>
        setNoRead: function (model, data) {
            var count = 0;
            var $el = null;

            //            data.eventNum = 1;
            //            data.soundNum = 1;
            if (!data) return;
            switch (feedView.model.get("feedType")) {
                case "event":
                    count = data.eventNum * 1;
                    feedView.modelLocal.set("noReadNum", count);
                    if (data.soundNum > 0) {
                        $("[feedtype='sound']").addClass("tag");
                    }
                    break;
                case "sound":
                    count = data.soundNum * 1;
                    feedView.modelLocal.set("noReadNum", count);
                    if (data.eventNum > 0) {
                        $("[feedtype='event']").addClass("tag");
                    }
                    break;
            }
            if (count) {
                $el = $(".feedMoreMessageBox");
                $el.find("a").html("有<em>" + count + "</em>条" + (feedView.model.get("feedType") == "event" ? "新鲜事" : "声音") + "，点击查看").off("click").on("click", function () {
                    var _that = this;

                    $(_that).slideUp(200, "swing", function () {
                        feedView.model.set("page", 0, { silent: true });
                        feedView.model.set("page", 1);
                        $(_that).css("display", "inline");
                    });
                });
                $el.show();
                document.title = "(" + count + ")" + document.title.replace(/^\(\d+\)/, "");
            } else {
                document.title = document.title.replace(/^\(\d+\)/, "");
            }
        },
        /// <summary>
        /// 更多feed
        /// </summary>
        doCallMore: function () {
            if (!feedView.modelLocal.get("appendMoreLocked")) {
                feedView.model.set("moreCount", feedView.model.get("moreCount") + 1);
                $(".loadingMore").show();
            }
        },
        /// <summary>
        /// feed刷新事件
        /// </summary>
        onReload: function () {
            $(".feedList").empty();
            $(".loadingMore").show();
            $(".pagingBar").hide();
            $(".feedMoreMessageBox").hide();
            player.release();
            helper.scrollTop();
            common.refreshFixedBox();
        },
        /// <summary>
        /// feed添加事件
        /// </summary>
        onAppendMore: function () {
            $(".loadingMore").hide();
        },
        /// <summary>
        /// 滚动条滚动后事件
        /// </summary>
        onScrollToBottom: function () {
            clearTimeout(feed.feedTimeID);
            if (!feedView.modelLocal.get("appendMoreLocked")) {
                feed.feedTimeID = setTimeout(function () {
                    var canseeh = $(window).height();
                    var h = $(window).scrollTop() + canseeh;

                    if (feed.feedLastOffset.top <= h) {
                        feed.doCallMore();
                    }
                }, 100);
            }
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            $("[feedtype]").off();
            $(window).off("scroll", this.onScrollToBottom);
            ifeed.release();
            ifollow.release();
            ireport.release();
            card.release();
            player.release();
            feedView.release();
            feedGroupModule.onRemoveLoad("feed_event");
            feedGroupModule.onRemoveAdd("feed_event");
            clearInterval(this.queryNewIntervalId);
        }
    };

    return feed;
});