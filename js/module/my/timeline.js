/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/user',
'model/timeline',
'module/common/ifeed',
'module/common/ifollow',
'module/common/iletter',
'module/player/player',
'module/card',
'module/feed_group/followmanager',
'module/common/ireport',
'module/blacklist',
'plugin/dialog',
'module/dialogs/city',
'module/dialogs/share2friend',
'plugin/jquery.selecter',
'plugin/jquery.timeline'],
function ($, _, Backbone, UserModel, TimelineModel, iFollow, iFollow, iLetter, player, card, followManager, iReport, blacklist, dialog, city, share2friend) {
    //var normalTimeID = 0, specialTimeID = 0, loop = false;
    var TimeLine = Backbone.View.extend({
        /// <summary>
        /// 时间轴初始化
        /// </summary>
        init: function () {
            var $timeline = $(".timeline");
            var $userDetailLeft = $(".user_detail_left");
            var $userIntro = $userDetailLeft.find(".userIntro");
            var $userIntroSpan = $userIntro.find("span");
            var $userIntroText = $userDetailLeft.find(".userIntroEdit textarea");
            var _this = this;

            $(".setGroups").on("click", function () {
                var data_options = $.extend({}, $.parser.parseOptions(this, [{
                    uid: "number", //人id
                    sids: "string", //组数据
                    nickname: "string"//人名
                }]));
                followManager.show($.extend({}, data_options));
            });
            $(".user_detail_left .area.own").on("click", function () {
                var $this = $(this);
                city.open(function (pro, city) {
                    //$this.html("<a>" + pro + " • " + city + "</a>");
                    var model = new UserModel();
                    model.set("province", pro);
                    model.set("city", city);
                    model.doChangeArea(function () {
                        var html = ['<span>',
                                    '<a href="javascript:;"><%=pro%></a>',
                                '&nbsp;•&nbsp;<a href="javascript:;"><%=city%></a>',
                            '</span>'];
                        $this.html(_.template(html.join(''))({ pro: pro, city: city }));
                    }, function (model, data) {
                        dialog.alert(data.msg);
                    });
                });
            });
            $userDetailLeft.find(".editDescription").on("click", function () {
                $userIntro.toggle();
                $userDetailLeft.toggleClass("is-intro-edit");
                $userIntroText.data("val", $userIntroText.val());
            });
            $userDetailLeft.find(".cancel").on("click", function () {
                $userIntro.toggle();
                $userDetailLeft.toggleClass("is-intro-edit");
                $userIntroText.val($userIntroText.data("val"));
            });
            $userDetailLeft.find(".editConfirm").on("click", function () {
                var opts = $.extend({}, $.parser.parseOptions(this, [{ "locked": "boolean"}]));
                var des = $userIntroText.val();
                var $that = $(this);
                if (opts.locked !== true) {
                    opts.locked = true;
                    helper.doChangeOptions($that, opts);
                    var user = new UserModel({
                        "personalSignature": des
                    });
                    user.doChangeDes(function () {
                        dialog.success("更改成功");
                        $userIntro.toggle();
                        $userDetailLeft.toggleClass("is-intro-edit");
                        opts.locked = false;
                        helper.doChangeOptions($that, opts);
                        $userIntroSpan.text(des.length > 70 ? des.substring(0, 70) + "..." : des);
                    }, function (model, data) {
                        dialog.alert(data.msg);
                        opts.locked = false;
                        helper.doChangeOptions($that, opts);
                    });
                }
            });
            //var a = ($(".more_operate").size());
            $(".more_operate").selecter({
                disabled: true,
                onChange: function (value) {
                    if (value == 1) {
                        iReport.doReport1(this, iReport);
                    } else if (value == 2) {
                        var opts = $.extend({}, $.parser.parseOptions(this, [{ uid: "number", nickname: "string", isBlack: "boolean"}]));
                        var $this = $(this);
                        if (opts.nickname && opts.uid) {
                            if (opts.isBlack) {
                                blacklist.remove(opts.nickname, opts.uid, function () {
                                    dialog.success("解除成功!");
                                    $this.text("加入黑名单");
                                    opts.isBlack = !opts.isBlack;
                                    helper.doChangeOptions($this, opts);
                                });
                            } else {
                                blacklist.add(opts.nickname, opts.uid, function () {
                                    dialog.success("拉黑成功!");
                                    $this.text("解除黑名单");
                                    opts.isBlack = !opts.isBlack;
                                    helper.doChangeOptions($this, opts);
                                });
                            }
                        }
                    } else if (value == 3) {
                        _this.copyLocation();
                    }
                    return false;
                }
            });
            $(".copy_link").on("click", function () {
                _this.copyLocation();
            });
            player.init();
            iLetter.bind($(".letterBtn"));
            iFollow.init();
            $timeline.timeline({
                setMarker: _this.setMarker,
                model: _this.model,
                setCombineMarker: _this.getCombineMarker,
                setLoading: _this.setLoading,
                viewHeight: $(window).height(),
                isSingle: true,
                scrollBottom: 500,
                onAppendData: function (index, options) {
                    var that = this;//todo命名
                    iFollow.init();
                    player.init();
                    iFollow.init();
                    card.render({
                        $container: $("#mainbox")
                    });
                    var $sound = that.marker.find("[sound_id]");
                    $sound.on("onExpand", function () {
                        $timeline.timeline("resetHeight", that);//todo 转化为自身的事件
                    });
                    that.marker.find(".moreBtn").off("click").on("click", function () {
                        var $this = $(this);
                        var $listItem = $this.closest(".timeline_content");
                        if ($listItem.hasClass("paging")) {
                            var data_options = $.extend({}, $.parser.parseOptions(this, [{ page: "number", cache_time_info: "string"}]));
                            var options = $timeline.timeline("options");
                            var model = options.model;

                            if (data_options.page) {
                                model.set({
                                    year: that.year,
                                    month: that.month,
                                    uid: options.uid,
                                    page: data_options.page,
                                    cache_time_info: data_options.cache_time_info
                                });
                                $this.before('<div class="loadingMore"></div>');
                                $this.hide();
                                model.getTimeLineInfo(function (model, data) {
                                    $this.closest(".timeline_feed").remove();
                                    $timeline.timeline("setData", {
                                        month: that.month,
                                        year: that.year,
                                        dom: $(that.marker),
                                        htm: data,
                                        isAppend:true
                                    });
                                });
                                model.set("cache_time_info", "");
                            }
                        } else {
                            $listItem.find(".gapB.hidden").slideToggle();
                            $listItem.find(".commentBubbleList .listItem.hidden").slideToggle();
                            $listItem.find(".personPanelBar2.hidden").slideToggle();
                            $this.toggleClass("expand").toggleClass("unexpand");
                            setTimeout(function () {
                                $timeline.timeline("resetHeight", that);
                            }, 200);
                        }
                        return false;
                    });
                },
                onYearSelect: function ($obj, year) {
                    var months = [];
                    var $ol = $obj.find("~.timelineMonthCon");

                    $ol.find("li a").each(function () {
                        months.push(parseInt($(this).attr("data-time")));
                    });

                    $(this).timeline("setMonths", {
                        year: year,
                        months: months,
                        dom: $ol
                    });
                },
                onMonthSelect: function (year, month) {
                    var _that = this;
                    var options = $(_that).timeline("options");
                    var model = options.model;
                    var div = $(_that).timeline("closeMonth", {
                        month: month,
                        year: year,
                        isAppend: true
                    });
                    model.set({
                        year: year,
                        month: month,
                        uid: options.uid,
                        page: 1
                    });
                    model.getTimeLineInfo(function (model, data, options) {
                        $(_that).timeline("setData", {
                            month: month,
                            year: year,
                            dom: $(div),
                            htm: data
                        });
                    }, function (model, data, options) {

                    });
                },
                onInit: function (options) {
                    //预加载出生日期
                    $(this).timeline("addMarker", {
                        marker: $(".timelinePanel.timelineMgb .timeline_content"),
                        year: options.birthYear,
                        month: options.birthMonth,
                        closeMonth: false
                    });
                    //预加载第一个月份
                    var months = [];
                    var $ol = $(".timelineLineList li.current ol.timelineMonthCon");
                    $ol.find("li a").each(function () {
                        months.push(parseInt($(this).attr("data-time")));
                    });
                    $(this).timeline("setMonths", {
                        year: options.currentYear,
                        months: months,
                        dom: $ol,
                        doClick: false
                    });
                    $(this).timeline("addMarker", {
                        marker: $(".timelinePanel.current"),
                        year: options.currentYear,
                        month: options.currentMonth,
                        closeMonth: true
                    });

                    return false;
                }
            });
            $(window).on("scroll", _this.onWindowScroll).on("resize", [_this], _this.onWindowResize);
        },
        copyLocation: function () {
            var pop = share2friend.createPop2(location.href);

            pop.open();
        },
        /// <summary>
        /// 时间轴标记生成函数
        /// </summary>
        /// <param name="year">年份信息</param>
        /// <param name="month">月份信息</param>
        setMarker: function (year, month) {
            var div = $("<div></div>");
            div.html(_.template($('#marker').html())({
                year: year,
                month: month
            }));

            return div.find(".timelinePanel");
        },
        /// <summary>
        /// 时间轴合并标记生成函数
        /// </summary>
        /// <param name="isMonth">是否合并月份</param>
        /// <param name="year">年份信息</param>
        /// <param name="start">开始信息</param>
        /// <param name="end">结束信息</param>
        getCombineMarker: function (isMonth, year, start, end) {
            var div = $("<div></div>");
            div.html(_.template($('#combinemarker').html())({
                isMonth: isMonth,
                year: year,
                start: start,
                end: end
            }));

            return div.find(".timelinePanel");
        },
        /// <summary>
        /// 时间轴等待标记生成函数
        /// </summary>
        /// <param name="year">年份信息</param>
        /// <param name="month">月份信息</param>
        setLoading: function (year, month) {
            var div = $("<div></div>");
            div.html(_.template($('#loading').html())());

            return div.find(".timelinePanel");
        },
        /// <summary>
        /// 滚动条滚动事件
        /// </summary>
        onWindowScroll: function () {
            var timelineRight = $(".timeline_right");
            var pos = timelineRight.offset();
            var top = 50;
            var scrollTop = $(document).scrollTop();

            if (scrollTop < pos.top - 20) {
                $(".timelineLine").css({
                    position: "absolute",
                    top: 25,
                    left: "",
                    right: 1
                });
            } else {
                $(".timelineLine").css({
                    position: "fixed",
                    top: top,
                    left: timelineRight.outerWidth() + pos.left - 71
                });
            }
            $(".timeline").timeline("scroll", true);
        },
        /// <summary>
        /// 窗体改变大小事件
        /// </summary>
        onWindowResize: function (e) {
            var view = e.data[0];
            view.onWindowScroll();
            $(".timeline").timeline("resize");
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            player.release();
            card.release();
            iFollow.release();
            iFollow.release();
            $(window).off("scroll", this.onWindowScroll).off("resize", this.onWindowResize);
            $(".timeline").timeline("destroy");
        }
    });

    return new TimeLine({
        model: new TimelineModel()
    });
});