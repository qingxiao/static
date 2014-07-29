/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午5:14
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'page/page_base',
    'module/blacklist',
    'plugin/dialog'],
    function ($, PageBase, blacklist, dialog) {
        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.bindEvents();
            },
            bindEvents: function () {
                var _this = this;
                $(".set_blacklist").on("click",".removeBtn", function () {
                    var $btn = $(this),
                        id = $btn.attr("remove_from_blacklist"),
                        $li = $btn.closest("li"),
                        name = $li.find('.set_blacklist_name a').html();
                    blacklist.remove(name, id, function(){
                        $li.slideUp();
                    });
                });
            },
            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });