/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-7
 * Time: 下午2:21
 * To change this template use File | Settings | File Templates.
 */


define(['jquery', 'page/page_base', "plugin/dialog", "page/upload/information"],
    function ($, PageBase, dialog, information) {


        var Page = PageBase.extend({
            init: function (data) {
                this.callParent("init");
                information.init({album:false});
                var $submit_save = $("#submit_save");
                $submit_save.click(function () {
                    if (information.check()) {
                        information.submitForm(this, "/my_tracks");
                    }
                    return false;
                });
            },

            release: function () {
                this.callParent("release");
            }
        });
        var page = new Page();
        return page;
    });