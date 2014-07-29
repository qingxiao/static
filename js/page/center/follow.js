/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午1:42
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'page/page_base',
    'module/my/follow'],
    function ($, _, Backbone, PageBase, follow) {
        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                follow.init();
            },
            release: function () {
                this.callParent("release");
                follow.release();
            }
        });
        return new Page();
    });