/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午5:28
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-7
 * Time: 下午4:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', 'module/player/player', 'model/tag', 'plugin/dialog',"module/common/iletter",  "module/common/ifollow" ,"helper"],
    function ($, PageBase, player, TagModel, dialog, iletter, ifollow, helper) {

        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.$el = $(".mainbox_wrapper");
                this.initData();
                this.initPlayer();
                this.bindEvents();
                ifollow.init();
                if(helper.isLogin()){
                    this.initAjaxContent();
                }

            },
            data: {
                pre: "",
                scope: "hot"
            },
            initData: function () {
                var _this = this;
                this.data = {
                    pre: _this.$el.find(".soundTab .selecter-selected").attr("data-value"),
                    scope: _this.$el.find(".soundTab [data-scope][data-selected]").attr("data-scope")
                };
            },
            initAjaxContent:function(){
                //右侧
                var id = this.getTagId();
                if(!id){
                    return;
                }
                var right = "/tag/"+ id +"/show_right",
                    $right = this.$el.find(".mainbox_right"),
                    _this = this;
                $right.addClass("loadingMore").load(right, function(){
                    $right.removeClass("loadingMore");
                    ifollow.init();
                    _this.afterRender();
                });
            },
            getTagId:function(){
                var url = window.location.href,
                    id = url.replace(/.*tag\//i,"");
                if(url.indexOf("follower")>0){
                    return false;
                }
                id = id.replace(/\/.*/, "");
                id = id.replace(/\?.*/, "");
                id =  encodeURIComponent(decodeURIComponent(id));
                if(window.console) console.log(id);
                return id;
            },
            initPlayer: function () {
                var _this = this;
                player.render({
                    $container: _this.$el
                });
            },
            release: function () {
                this.callParent("release");
                this.unbindEvents();
            },
            bindEvents: function () {
                var _this = this,
                    $el = this.$el;
                //全部 只看+v
                $el.find(".soundTab .selecter").selecter({
                    onChange: function (value) {
                        _this.data.pre = value || "";
                        _this.openWindow();
                    }
                });
                //热门 最新更新
                $el.on("click", ".soundTab a[data-scope]", function () {
                    var $a = $(this);
                    _this.data.scope = $a.attr("data-scope");
                    _this.openWindow();
                    $a.parent().find("[data-selected]").removeAttr("data-selected");
                    $a.attr('data-selected', true);
                });
                //感兴趣
                var $interestBtn = $el.find(".interestBtn"),
                    $tagCount = $el.find(".tagCount"),
                    tagName = $interestBtn.attr("data-tag") || $(".tagName").text();
                var tagModel = new TagModel({
                    tagName: tagName
                });

                $el.on("click", ".interestBtn", function () {
                    var $btn = $(this);
                    tagModel.switchFollowedTag(function (model, res, op) {
                        if (res.response == "create") {
                            //dialog.success("添加成功");
                            $tagCount.each(function(){
                                var $count = $(this);
                                $count.text(($count.text() || 0)*1 + 1);
                            });
                            $btn.addClass("already");
                        }
                        if (res.response == "destroy") {
                            //dialog.success("取消成功");
                            $tagCount.each(function(){
                                var $count = $(this);
                                $count.text(($count.text() || 0)*1 - 1);
                            });
                            $btn.removeClass("already");
                        }
                    });
                });

                iletter.bind($(".sendLetterBtn"));
            },
            openWindow: function () {
                var href = window.location.href;
                if (href.indexOf("?")) {
                    href = href.replace(/\?.*/, "");
                }
                window.location.href = href + "?" + "scope=" + this.data.pre + this.data.scope;
            },
            unbindEvents: function () {
                this.$el.off();
            }
        });
        return new Page();
    });