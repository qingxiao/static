/*
 * 个人中心
 */
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults:
        {
            report_id: undefined,
            content: {},
            album_id: undefined,
            uid: undefined,
            nickname: undefined,
            content_title: undefined,
            is_processed: undefined,
            content_type: undefined,
            fujian_path: undefined,
            track_id: undefined
        },
        /// <summary>
        ///	取得feed分组信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        doReport: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({},
            {
                url: "/report/create",
                type: "post",
                data: _this.toJSON(),
                success: function (model, data, options) {
                    if (data && data.result == "success") {
                        success(model, data, options);
                    }
                    else {
                        error(model, data, options);
                    }
                }
            });
        }
    });

    return Model;
});