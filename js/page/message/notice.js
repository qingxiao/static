define(['jquery', "page/page_base", "module/message/notice"], function ($, PageBase, Notice) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            Notice.init();
        },
        release: function () {
            this.callParent("release");
            Notice.release();
        }
    });
    return new Page();
});