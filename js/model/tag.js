/**
* 说明：领域感兴趣接口
* 提供领域感兴趣，取消感兴趣。
* 
**/
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults: {
            tagName: 0 //标签名称
        },
        /// <summary>
        ///	删除感兴趣标签
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        delFollowingTag: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/following_tags/" + encodeURIComponent(_this.get("tagName")) + "/destroy",
                type: "post",
                dataType: "json",
                success: function (model, data, options) {
                    if (data.res === true) {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	添加感兴趣标签
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        switchFollowedTag: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/tag/" + encodeURIComponent(_this.get("tagName")) + "/switch_follow",
                type: "post",
                dataType: "json",
                success: function (model, data, options) {
                    if (data.response === "create" || data.response === "destroy") {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	添加标签
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        create: function(success, error){
        	 var _this = this;
        	 success = success || $.noop;
             error = error || $.noop;
             _this.save({}, {
                 url: "/following_tags/create",
                 data :{tname:this.get("tagName")},
                 type: "post",
                 dataType: "json",
                 success: function (model, data, options) {
                     if (data.res === false) {
                    	 error(data.msg, model, data, options);
                     } else {
                    	 success(model, data, options);
                     }
                 }
             });
        }
    });

    return Model;
});