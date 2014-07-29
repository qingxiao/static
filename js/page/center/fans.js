define([
'jquery',
'underscore',
'backbone',
'module/my/fans',
'page/page_base'],
function ($, _, Backbone, fans, PageBase) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            fans.init();
        },
        release: function () {
            this.callParent("release");
            fans.release();
        }
    });
    return new Page();
});