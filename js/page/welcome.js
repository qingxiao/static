/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-7-31
 * Time: 上午10:50
 * To change this template use File | Settings | File Templates.
 * modify 2013-2-22
 */
define(['jquery', 'backbone', 'module/my/welcome', 'module/foot'], function ($, Backbone, welcome) {
    var Page = Backbone.View.extend({
        init: function () {
            //this.callParent("init");
            //this.addEvent();
            welcome.init();
            helper.doCheckVersion();
        },
        release: function () {
            //this.callParent("release");
            welcome.release();
        }
    });
    return new Page();
});
