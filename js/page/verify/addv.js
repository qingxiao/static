define([
'jquery',
'underscore',
'backbone',
'module/verify/addv',
'page/page_base'],
function ($, _, Backbone, addv, PageBase) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            addv.init();
        },
        release: function () {
            this.callParent("release");
            addv.release();
        }
    });
    var page = new Page();
    page.init();
    return page;
});