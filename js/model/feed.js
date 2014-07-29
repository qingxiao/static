define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults: {
            groupID: '0',
            feedID: 0,
            feedType: '',
            eventNum: '0',
            soundNum: '0',
            pageSize: 0,
            totalSize: 0,
            moreCount: 0,
            page: 0,
            timeLine: 0
        },
        /// <summary>
        ///	获得feed未读信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        getNoRead: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/feed/no_read",
                type: "post",
                dataType: "json",
                data: {
                    groupID: _this.get("groupID"),
                    feedType: _this.get("feedType")
                },
                success: function (model, data, options) {
                    if (data && data.groupID != undefined) {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	删除feed数据
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        deleteFeed: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/feed/del_feed",
                type: "post",
                data: {
                    feed_id: _this.get("feedID"),
                    feedType: _this.get("feedType")
                },
                success: function (model, data, options) {
                    success(model, data, options);
                }
            });
        },
        /// <summary>
        ///	获得更多feed
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="datas">数据</param>	
        getMoreFeed: function (success) {
            var _this = this;
            success = success || $.noop;

            $.ajax({
                url: "/feed/index",
                dataType: "script",
                data: {
                    groupID: _this.get("groupID"),
                    feedType: _this.get("feedType"),
                    pageSize: _this.get("pageSize"),
                    moreCount: _this.get("moreCount"),
                    page: _this.get("page"),
                    timeLine: _this.get("timeLine")
                },
                success: function () {
                    success();
                }
            });
        }
    });

    return Model;
});