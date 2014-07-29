define([
'jquery',
'underscore',
'backbone',
'module/feed/feed_event',
'module/feed/feed',
'page/page_base'],
function ($, _, Backbone, feedModule, feedView, PageBase) {
    var Page = PageBase.extend({
        datas: feedView.model,
        init: function (data) {
            this.callParent("init");
            feedModule.init(data);
        },
        release: function () {
            this.callParent("release");
            feedModule.release();
        },
        setMore: function (options) {
            feedModule.setMore(options);
        },
        initList: function (listItem, group_ids) {
            feedModule.initList(listItem, group_ids);
        }
    });

    return new Page();
});