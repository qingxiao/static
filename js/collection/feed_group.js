define(['jquery', 'underscore', 'backbone', 'model/feed_group'], function ($, _, Backbone, Model) {
    var Collection = Backbone.Collection.extend({
        model: Model,
        fetch: function (options) {
            options = options || {};

            _.extend(options, {
                url: '/following_groups'
            });
            Backbone.Collection.prototype.fetch.call(this, options);
        },
        parse: function (response) {
            return _.map(response, function (data) {
                var model = {
                    id: data.id,
                    title: data.title,
                    uid: data.uid,
                    createdAt: data.created_at,
                    isAutoDownload: data.is_auto_download,
                    isPublic: data.is_public,
                    orderNum: data.order_num,
                    updatedAt: data.updated_at
                };

                return model;
            });
        }
    });
    return Collection;
});