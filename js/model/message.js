/// <summary>
///	用户最新消息接口
/// </summary>
define(['jquery', 'underscore', 'backbone', 'json2'], function ($, _, Backbone, JSON) {
    var Model = Backbone.Model.extend({
        defaults: {
            category: "",
            newMessage: 0,
            newNotice: 0,
            newComment: 0,
            newQuan: 0,
            newFollower: 0,
            newLikes: 0
        },
        /// <summary>
        ///	获得用户最新消息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        getNewMessage: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/notices",
                type: "post",
                dataType: "json",
                success: function (model, data, options) {
                    if (data.res && data.res != false && data.res != "0") {
//                        model.set({
//                            newMessage: 1,
//                            newNotice: 1,
//                            newComment: 1,
//                            newQuan: 1,
//                            newFollower: 1,
//                            newLikes: 1
//                        });
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        parse: function (data) {
            if (!data.res) {
                data.res = {};
            }
            return {
                newMessage: data.res.new_message,
                newNotice: data.res.new_notice,
                newComment: data.res.new_comment,
                newQuan: data.res.new_quan,
                newFollower: data.res.new_follower,
                newLikes: data.res.new_like
            };
        },
        /// <summary>
        ///	清除用户消息提醒
        /// </summary>
        /// category:种类 new_message / new_notice / new_comment / new_quan / new_follower / ""
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        clearNewMessage: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/notices/clear",
                type: "post",
                dataType: "json",
                data: {
                    category: _this.get("category")
                },
                success: function (model, data, options) {
                    if (data.res != false) {
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