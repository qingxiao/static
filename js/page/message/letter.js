define(['jquery', "page/page_base", "module/message/letter"], function ($, PageBase, Letter) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            Letter.init();
        },
        release: function () {
            this.callParent("release");
            Letter.release();
        }
    });
    return new Page();
});