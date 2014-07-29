/**
* 说明：私信接口
* 提供私信的操作接口，包括添加，删除，批量删除。
* 
* 
**/
define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults:
        {
            id: 0,
            //私信id
            nickname: '',
            // 发送给谁
            content: '',
            //发送内容
            ids: [],
            //删除私信的id数组
            pass: 0
        },
        /// <summary>
        ///	发私信
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        add: function (success, error) {
            var _this = this;

            success = success || $.noop;
            error = error || $.noop;
            _this.save({},
            {
                url: "/msgcenter/create_letter",
                type: "post",
                dataType: "json",
                data:
                {
                    to_nickname: _this.get("nickname"),
                    content: _this.get("content")
                },
                success: function (model, data, options) {
                    if (data.res !== false) {
                        success(model, data, options);
                    }
                    else {
                        error(model, data, options);
                    }
                },
                error: function (model, data, options) {
                    error(model, null, options);
                }
            });
        },
        /// <summary>
        ///	删除一封私信
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        del: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({},
            {
                url: "/msgcenter/destroy_letter",
                type: "post",
                dataType: "json",
                data: {
                    id: _this.get("id")
                },
                success: function (model, data, options) {
                    if (data.res === true) {
                        success(model, data, options);
                    }
                    else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	删除所有私信
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        delAll: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({},
            {
                url: "/msgcenter/destroy_letter_with_uid",
                type: "post",
                dataType: "json",
                data: {
                    uid: _this.get("id")
                },
                success: function (model, data, options) {
                    if (data.res === true) {
                        success(model, data, options);
                    }
                    else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	删除选中的私信
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        delArray: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({},
            {
                url: "/msgcenter/batch_destroy_letter",
                type: "post",
                dataType: "json",
                validate: false,
                data:
                {
                    ids: _this.get("ids")
                },
                success: function (model, data, options) {
                    if (data.res === true) {
                        success(model, data, options);
                    }
                    else {
                        error(model, data, options);
                    }
                }
            });
        },
        validate: function (attrs, options) {
            if (!attrs.nickname) {
                return "收件人不能为空";
            } else if (!attrs.content) {
                return "发送消息不能为空";
            } else if (attrs.pass) {
                return "消息字数超出";
            }
        }
    });

    return Model;
});