/*
 * 个人中心
 */
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults:
        {
            year: 0,
            month: 0,
            page: 1,
            per_page: 30
        },
        /// <summary>
        ///	取得feed分组信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        getTimeLineInfo: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;
//todo
            _this.save({},
            {
                url: "/center/timeline_list",
                type: "get",
                dataType: "html",
                data: _this.toJSON(),
                success: function (model, data, options) {
                    model.set(model.get("page") + 1);
                    if (data) {
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