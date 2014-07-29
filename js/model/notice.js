/// <summary>
///	系统通知
/// </summary>
define(['jquery', 'underscore', 'backbone', 'json2'], function ($, _, Backbone, JSON) {
    var Model = Backbone.Model.extend({
        defaults: {
            id: 0
        },
        /// <summary>
        ///	获得用户最新消息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        deleteNotice: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/msgcenter/destroy_notice",
                type: "post",
                dataType: "json",
                data: {
                    id: this.get("id")
                },
                success: function (model, data, options) {
                    if (data.result && data.result == "success") {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	获得用户最新消息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        deleteLike: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/msgcenter/destroy_like",
                type: "post",
                dataType: "json",
                data: {
                    id: this.get("id")
                },
                success: function (model, data, options) {
                    if (data.result && data.result == "success") {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        }
    });

    return Model;
});