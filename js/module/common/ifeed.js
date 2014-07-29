define([
'jquery',
'underscore',
'backbone'],
function ($, _, Backbone) {
    var ifeedView = Backbone.View.extend({
        feedModel: null,
        init: function () {
            this.release();
            $(".feed .feed_operate .closeBtn[feed_id]").on("click", [this], this.doDelFeed);
        },
        doDelFeed: function (e) {
            var $this = $(this);
            var feedId = $this.attr("feed_id");
            var feedModel = e.data[0];

            if (feedModel && feedId) {
                feedModel.model.set("feedID", feedId);
                feedModel.model.deleteFeed(function (model, data, options) {
                    $this.closest(".listItem").fadeOut(200);
                }, function (model, data, options) {

                });
            }
        },
        release: function () {
            $(".feed .feed_operate .closeBtn[feed_id]").off("click");
        }
    });

    return new ifeedView({
        model: null
    });
});