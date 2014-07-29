/*
 * 评论详情
 */
define([ 'jquery', 'underscore', 'backbone', './cache' ], function ($, _, Backbone, Cache) {
    var Model = Backbone.Model.extend({
        defaults: {
            id: "",
            avatarPath: "",
            content: "",
            coverPath: "",
            createdAt: "",
            nickname: "",
            parentId: "",
            // playPath : "",
            // playPath128 : "",
            // playPath32 : "",
            // playPath64 : "",
            // trackAvatarPath : "",
            // trackCreatedAt : "",
            // trackDuration : 0,
            // trackNickname : "",
            // trackTitle : "",
            // trackUploadSource : "",
            second: "",
            trackId: "",
            trackUid: "",
            uid: "",
            updatedAt: "",
            uploadSource: "",
            userSource: ""
        },
        check: function (attrs, options) {
            var attrs = this.toJSON();
            if (!attrs.content) {
                return "评论不能为空。";
            }
            var reg = /[\u0391-\uFFE5]/g;//双字节（汉字+双字节字符）
            var temp_str = $.trim(attrs.content).replace(reg, "aa");
            var len = Math.ceil(temp_str.length / 2);
            if (len > 140) {
                return "评论不能超过140个字。";
            }
        },
        fetch: function (options) {
            options = options || {};
            _.extend(options, {
                url: '/tracks/' + this.id + '.json'
            });
            Backbone.Model.prototype.fetch.call(this, options);
        },
        parse: function (data) {
            return {
                id: data.id,
                avatarPath: data.avatar_url,
                content: data.content,
                coverPath: data.cover_path,
                createdAt: data.created_at,
                niceTime: helper.getNiceTime(data.created_at),
                nickname: data.nickname,
                parentId: data.parent_id,
                // playPath : data.play_path,
                // playPath128 : data.play_path_128,
                // playPath32 : data.play_path_32,
                // playPath64 : data.play_path_64,
                // trackAvatarPath : data.track_avatar_path,
                // trackCreatedAt : data.track_created_at,
                // trackDuration : data.track_duration,
                // trackNickname : data.track_nickname,
                // trackTitle : data.track_title,
                // trackUploadSource : data.track_upload_source,
                second: data.second,
                trackId: data.track_id,
                trackUid: data.track_uid,
                uid: data.uid,
                updatedAt: data.updated_at,
                uploadSource: data.upload_source,
                userSource: data.user_source
            };
        },
        /*
         * 创建评论
         */
        create: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;
            this.save({}, {
                url: "/comments/create",
                data: {
                    track_id: this.get("trackId"),
                    parent_id: this.get("parentId"),
                    content: this.get("content"),
                    sharing_to: this.get("sharing_to"),
                    no_more_alert: this.get("no_more_alert"),
                    second: this.get("second")
                },
                type: "post",
                success: function (model, response, options) {
                    if (response.res === false) {
                        error(model, response);
                        return;
                    }
                    success(model, response);
                },
                error: function (model, xhr, options) {
                    error(model, xhr, options);
                }
            });
        },
        del: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;
            this.destroy({
                url: "/tracks/" + this.get("trackId") + "/comments/" + this.id + "/destroy",
                type: "post",
                success: function (model, response, options) {
                    if (response.res === false) {
                        error(model, response);
                        return;
                    }
                    success(model, response);
                },
                error: function (model, xhr, options) {
                    error(model, xhr, options);
                }
            });
        },
        //个人消息中心删除评论   /msgcenter/destroy_comment?track_id=111&comment_id=332
        delMycenter: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;
            var _this = this;
            this.destroy({
                url: "/msgcenter/destroy_comment",
                type: "post",
                data: {
                    track_id: _this.get("track_id"),
                    comment_id: _this.get("comment_id")
                },
                success: function (model, response, options) {
                    if (response.res === false) {
                        error(model, response);
                        return;
                    }
                    success(model, response);
                },
                error: function (model, xhr, options) {
                    error(model, xhr, options);
                }
            });
        }
    }, {
        cache: new Cache()
    });
    return Model;
});