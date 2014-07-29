/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', "module/common/ifollow", "module/common/iletter", "module/common/picshow"],
    function ($, PageBase, ifollow, iletter, picshow) {

        var Page = PageBase.extend({
            data: {
                category: "",
                tag: "",
                condition: "",
                page: 1
            },
            init: function () {
                this.callParent("init");
                this.$el = $("#discoverRadioPage");
                this.$personalMain = this.$el.find(".personalMain");
                this.initData();
                this.bindEvents();
                $(".bodyBgColor").addClass("bodyBgColor2");
                ifollow.init();
                picshow.init(49, 50);
                $(".bud-1 .userfacebase,.bud-2 .userfacebase,.bud-3 .userfacebase").on({
                    mouseenter: function (e) {
                        var $el = $(e.currentTarget), $i = $el.find("i");
                        $i.stop().animate({
                            left: 150 / 2 * 3 + 160
                        }, 800, function () {
                            $i.css("left", (150 / 2 * 3 * -1 - 160) + "px");
                        });
                    }
                });
                $(".radioUserListItem").on("click", function (e) {
                    var $tag = $(e.target);
                    if($tag.attr("href")){
                        return;
                    }
                    if($tag.closest("a").size() !=0){
                        return;
                    }
                    var href = $(this).find(".radioUserPanel .userface110").attr("href");
                    if (href) {
                        location.href = href;
                    }
                    return false;
                });
            },
            initData: function () {
                var $pm = this.$personalMain;
                this.data = {
                    category: $pm.find(".category .nav_item.on").attr("data-cid") || "",
                    tag: $pm.find(".circle .nav_item.on").attr("data-tname") || "",
                    condition: "",
                    page: $pm.find(".pagingBar_wrapper a.on").text()
                };
            },
            release: function () {
                this.callParent("release");
                this.unbindEvents();
                picshow.release();
                $(".bodyBgColor").removeClass("bodyBgColor2");
            },
            bindEvents: function () {
                var _this = this;
                //分类点击
                this.$personalMain.on("click", ".category .nav_item", function () {
                    var $item = $(this);
                    var category = $item.attr("data-cid");
                    if (_this.data.category == category) {
                        return;
                    }
                    _this.data.category = category;
                    _this.data.tag = "";
                    //_this.data.condition = "";
                    _this.data.page = 1;
                    $item.parent().find(".on").removeClass("on");
                    $item.addClass("on");
                    _this.getResultList();
                });
                //标签点击
                this.$personalMain.on("click", ".circle .nav_item", function () {
                    var $item = $(this);
                    var tag = $item.attr("data-tname");
                    if (_this.data.tag == tag) {
                        return;
                    }
                    _this.data.tag = tag;

                    _this.data.condition = "";
                    _this.data.page = 1;
                    $item.parent().find(".on").removeClass("on");
                    $item.addClass("on");
                    _this.getResultList();
                });
                //condition点击
                this.$personalMain.on("click", ".titleCon  a[data-condition]", function () {
                    var $item = $(this);
                    var condition = $item.attr("data-condition");
                    if (_this.data.condition == condition) {
                        return;
                    }
                    _this.data.condition = condition;
                    _this.data.page = 1;
                    _this.getResultList();
                });
                //分页
                this.$personalMain.on("click", ".pagingBar_wrapper  a[data-page]", function () {
                    var $item = $(this);
                    var page = $item.attr("data-page");
                    if (_this.data.page == page) {
                        return;
                    }
                    _this.data.page = page;
                    _this.getResultList();
                    return false;
                });
                //发私信
                iletter.bind($(".radioLetterIcon"));
            },
            unbindEvents: function () {
                this.$personalMain.off();
            },
            getResultList: function () {
                var $entry = $("#explore_user_detail_entry"), height = $entry.height();
                var $loading = $(document.createElement("div"));

                $loading.height(height);
                $loading.addClass("loadingMore");
                $entry.empty().append($loading);

                $.get("/explore/user_detail", this.data, function (result) {
                    $entry.empty().html(result);
                    //$(".backToTop").click();
                    iletter.bind($(".radioLetterIcon"));
                    ifollow.init();
                });
            }
        });
        return new Page();
    });