define([
'jquery',
'underscore',
'backbone',
'page/page_base',
'module/my/timeline',
'module/my/soundwallbg'],
function ($, _, Backbone, PageBase, timeLine, soundwallbg) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            timeLine.init();
            soundwallbg.init();
            this.bindEvents();
        },
        bindEvents:function(){

        },
        unbindEvents:function(){
            $(".picWall .next-page").off();
        },
        release: function () {

            this.unbindEvents();
            timeLine.release();
            soundwallbg.release();
            this.callParent("release");
        }
    });
    var page = new Page();
    return page;
});