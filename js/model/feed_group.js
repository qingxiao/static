define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        idAttribute: "id",
        defaults: {
            id: 0,
            title: "",
            title1: "",
            uid: 0,
            createdAt: '',
            isAutoDownload: false,
            isPublic: false,
            orderNum: 0,
            updatedAt: '',
            followingGroupIds: [],
            isAutoPush: false
        },
        parse: function (data) {
            if (!data.res) {
                data.res = {};
            }
//            if (data.title) {
//                data.title = decodeURIComponent(data.title);
//            }

            return data;
        },
        /// <summary>
        ///	创建feed分组信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        createGroup: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/following_groups/create",
                type: "post",
                dataType: "json",
                data: {
                    title: _this.get("title")
                },
                success: function (model, data, options) {
                    if (data.id) {
                        model.set("id", data.id);
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        ///	删除feed分组信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        deleteGroup: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/following_groups/" + _this.get("id") + "/destroy",
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
        ///	修改feed分组信息
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        editGroup: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/following_groups/" + _this.get("id") + "/update",
                type: "post",
                dataType: "json",
                data: {
                    title: _this.get("title")
                },
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
        ///	关注人后加入feed分组
        /// </summary>
        /// <param name="success">成功回调</param>	
        /// <param name="error">失败回调</param>	
        followGroups: function (success, error) {
            var _this = this;
            success = success || $.noop;
            error = error || $.noop;

            _this.save({}, {
                url: "/followings/set_groups",
                type: "post",
                dataType: "json",
                data: {
                    following_uid: _this.get("uid"),
                    following_group_ids: _this.get("followingGroupIds"),
                    is_auto_push: _this.get("isAutoPush")
                },
                success: function (model, data, options) {
                    if (data.groups) {
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