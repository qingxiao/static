/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', "underscore", 'plugin/jquery.menu-aim'],
    function ($, PageBase, _) {

        var Page = PageBase.extend({
            url_tag: "/explore/tag_list",
            container: "#discoverSound",
            initCommon: function () {
                this.callParent("init");
                this.$container = $(this.container);
                this.$tagWrap = $(".tag_wrap");
                this.category_text = "";
                this.initData();
                this.bindEvents();
                $(".bodyBgColor").addClass("bodyBgColor2");
            },

            createTags: function (idx, li_height) {
                var _this = this,
                    category = this.data.category;

                var $cache = this.$tagWrap.find("[data-cache=" + category + "]");

                if ($cache.size() > 0) {
                    this.$tagWrap.children().hide();
                    $cache.show();
                    _this.resetTagsTop(idx, li_height);
                    return;
                }

                if (!this.index_load) {
                    this.index_load = {};
                }
                if (this.index_load[idx]) {
                    return;
                }
                this.index_load[idx] = true;
            	//todo 放model里面
                $.get(this.url_tag, this.data, function (data) {
                    if (!data) {
                        return;
                    }
                    var tags = data.list;

                    var $div = $("<div></div>").attr("data-cache", category);
                    //$div.append('<a class="tagBtn on" href="javascript:;" tid="" ><span>热门</span></a>');
                    for (var i = 0, l = tags.length; i < l; i++) {
                        var tag = tags[i];
                        $div.append('<a class="tagBtn" href="javascript:;" tid="' + (tag.tname || "") + '"><span>' + tag.tname + '</span></a>');
                    }
                    _this.$tagWrap.children().hide();
                    $div.appendTo(_this.$tagWrap);
                    _this.resetTagsTop(idx, li_height);
                });

            },
            resetTagsTop: function (idx, li_height) {
                var $tagWrap = this.$tagWrap,
                    $tags_panel = $tagWrap.parent();
                if (idx >= 3) {
                    var top = idx * li_height,
                        ul_top = $tags_panel.closest("ul").position().top,
                        panel_height = $tags_panel.height(),
                        win_height = $(window).height(),
                        dom_top = $(document).scrollTop();
                    //判断是不是标签下面是不是超出了window了
                    if (top + ul_top + panel_height > dom_top + win_height) {
                        top = dom_top + win_height - panel_height - ul_top;
                    }
                    $tags_panel.css("top", top);

                } else {
                    $tags_panel.css("top", 0);
                }
            },
            release: function () {
                this.unbindEvents();
                this.index_load = null;
                $(".bodyBgColor").removeClass("bodyBgColor2");
            },
            render: function () {
            },
            afterRender: function () {
            },
            bindEvents: function () {

                var $container = this.$container,
                    $sortList = $container.find(".sort_list"),
                    _this = this;
                //精彩推荐 最多收藏 最新上传
                $container.on("click", ".nav_list li", function () {
                    var $li = $(this);
                    if ($li.hasClass("on")) {
                        return;
                    }
                    $li.parent().find("li.on").removeClass("on");
                    $li.addClass("on");
                    _this.data.condition = $li.attr("condition");
                    //此时为全部  标签上的on效果要消失
                    $container.find(".tags_panel .tagBtn.on").removeClass("on");
                    _this.onTagSelectBefore();
                    _this.onTagSelect();

                });
                var $dis_sound_sort = $container.find(".dis_sound_sort");
                //分类列表
                $dis_sound_sort.on("mouseleave", ".sort_list", function () {
                    if ($sortList.attr("data-show-tags")) {
                        return;
                    }
                    $sortList.removeClass("is-show-tags");
                });
                $dis_sound_sort.find(".sort_list").menuAim({
                    rowSelector: "> li",
                    tolerance: 5,
                    activate: function (li) {
                        var $li = $(li);
                        if ($sortList.attr("is-tags-enter")) {
                            return;
                        }
                        $sortList.addClass("is-show-tags");

                        $li.parent().find("li.hover").removeClass("hover");
                        $li.addClass("hover");
                        var cache_category =  _this.data.category,
                            cache_category_text = _this.category_text;
                        //临时改变 获取该分类下的标签；
                        _this.data.category = $li.attr("cid");
                        //_this.category_text = $.trim($li.text());
                        _this.createTags($li.index(), $li.outerHeight());
                        _this.data.category = cache_category;
                    },
                    enter: function (li) {
                        var $li = $(li);
                        if ($li.hasClass("hover")) {
                            $sortList.addClass("is-show-tags");
                        }
                    },
                    deactivate: function (li) {

                    }
                });

                $dis_sound_sort.on("mouseenter", ".sort_list .tags_panel", function () {
                    $sortList.attr("is-tags-enter", true);
                });

                $dis_sound_sort.on("mouseleave", ".sort_list .tags_panel", function () {
                    $sortList.removeAttr("is-tags-enter");
                });
                // 分类  hover

                $dis_sound_sort.on("click", ".sort_list li", function () {
                    var $li = $(this);

                    if ($li.hasClass("on") && parseInt($li.attr("is-data-all")) !== 0) {
                        return;
                    }
                    $li.attr("data-all", 1);
                    $li.parent().find("li.on").removeClass("on");
                    $li.addClass("on");

                    var cid = $li.attr("cid");
                    _this.data.category = cid;
                    _this.category_text = $.trim($li.text());
                    //此时为全部  标签上的on效果要消失
                    $container.find(".tags_panel .tagBtn.on").removeClass("on");
                    _this.onTagSelectBefore();
                    _this.onTagSelect();
                });
                //标签浮动
                /*  $dis_sound_sort.on("click", ".pin_btn", function () {
                var $btn = $(this),
                $tagsPanel = $btn.parent(".tags_panel");
                $btn.toggleClass("pin_fixed");

                if ($btn.hasClass("pin_fixed")) {
                $sortList.attr("data-show-tags", true);
                } else {
                $sortList.removeAttr("data-show-tags");
                }
                });*/

                //标签选择
                $dis_sound_sort.on("click", ".tags_panel .tagBtn", function () {
                    var $tagBtn = $(this);
                    if ($tagBtn.hasClass("on")) {
                        return;
                    }
                    var $tagWrap = $tagBtn.closest(".tag_wrap");
                    $tagWrap.find(".on").removeClass("on");
                    $tagBtn.addClass("on");

                    var $sortList = $container.find(".sort_list"),
                        cid = $tagBtn.parent().attr("data-cache"),
                        $curLi = $sortList.find("li[cid=" + cid + "]");

                    _this.data.tag = $tagBtn.attr("tid");
                    _this.data.category = cid;
                    _this.category_text = $.trim($curLi.text());
                    _this.onTagSelectBefore();
                    _this.onTagSelect();
                    $sortList.find("li.on").removeClass("on");
                    $curLi.addClass("on").attr("is-data-all", 0);
                    _this.data.tag = "";
                });
                //面包屑事件
                var $crumb_sub = $("#crumb_sub"),
                     $crumb_all = $("#crumb_all");
                $crumb_all.on("click", "a", function () {
                    $container.find(".sort_list li").eq(0).trigger("click");
                });
                $crumb_sub.on("click", "a", function () {
                    var $a = $(this),
                        cid = $a.attr("cid");
                    $container.find(".sort_list li[cid=" + cid + "]").trigger("click");
                });

            },
            onTagSelect: function () {
                //子类覆盖
            },
            onTagSelectBefore: function () {
                this.createCrumbs();
            },
            createCrumbs: function () {
                var data = this.data,
                    category = data.category,
                    category_text = this.category_text,
                    tag = data.tag,
                    $crumb_sub = $("#crumb_sub"),
                    $crumb_sub_a = $crumb_sub.find("a"),
                    $crumb_tag = $("#crumb_tag"),
                    $crumb_tag_span = $crumb_tag.find("span");
                if (category && category_text) {
                    $crumb_sub.show();
                    $crumb_sub_a.text(category_text).attr("cid", category);
                } else {
                    $crumb_sub.hide();
                }
                if (tag) {
                    $crumb_tag.show();
                    $crumb_tag_span.text(tag);
                } else {
                    $crumb_tag.hide();
                }
            },
            unbindEvents: function () {
                this.$container.off();
            }


        });
        return Page;
    });