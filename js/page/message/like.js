define(['jquery', "page/page_base", "module/message/like"], function ($, PageBase, Like) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            Like.init();
        },
        release: function () {
            this.callParent("release");
            Like.release();
        }
    });
    return new Page();
});