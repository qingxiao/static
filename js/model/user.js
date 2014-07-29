/*
 * 用户
 */
define(['jquery', 'underscore', 'backbone', './cache'], function ($, _, Backbone, Cache) {
    var Model = Backbone.Model.extend({
        defaults: {
            id: "",
            nickname: "",
            logoPic: "",
            email: "",
            account: null,
            mobile: null,
            isVerified: false,
            isCompleted: true,
            isVEmail: false,
            isVMobile: false,
            isRobot: false,
            province: "",
            city: "",
            town: null,
            country: "",
            personalSignature: "",
            ptitle: null,
            isGuideCompleted: true,
            taskCompleteProfile: true,
            taskFollow: true,
            taskDownloadApp: true,
            taskEmail: false,
            vCompany: null,
            vTags: null,
            vCategoryId: null,
            deviceToken: null,
            isLoginBan: false,
            isDeleted: false,
            registerCategory: "",
            personDescribe: null,
            guidePlayPanel: true,
            guideVoicePanel: true,
            guideSharePanel: true,
            createdTime: "",
            loginBanStart: null,
            loginBanEnd: null,
            isNotFollowing: false,
            beFollowed: false,
            tracksCount: 0,
            followingsCount: 0,
            followersCount: 0,
            avatarUrl60: "",
            ids: []
        },
        fetch: function (options) {
            options = options || {};
            var key = this.id || "n" + this.get("nickname");
            _.extend(options, {
                url: '/' + key + '/card'
            });
            Backbone.Model.prototype.fetch.call(this, options);
        },
        parse: function (data) {
            return {
                id: data.uid,
                nickname: data.nickname,
                logoPic: data.logoPic,
                email: data.email,
                account: data.account,
                mobile: data.mobile,
                isVerified: data.isVerified,
                isCompleted: data.isCompleted,
                isVEmail: data.isVEmail,
                isVMobile: data.isVMobile,
                isRobot: data.isRobot,
                province: data.province,
                city: data.city,
                town: data.town,
                country: data.country,
                personalSignature: data.personalSignature,
                ptitle: data.ptitle,
                isGuideCompleted: data.isGuideCompleted,
                taskCompleteProfile: data.taskCompleteProfile,
                taskFollow: data.taskFollow,
                taskDownloadApp: data.taskDownloadApp,
                taskEmail: data.taskEmail,
                vCompany: data.vCompany,
                vTags: data.vTags,
                vCategoryId: data.vCategoryId,
                deviceToken: data.deviceToken,
                isLoginBan: data.isLoginBan,
                isDeleted: data.isDeleted,
                registerCategory: data.registerCategory,
                personDescribe: data.personDescribe,
                guidePlayPanel: data.guidePlayPanel,
                guideVoicePanel: data.guideVoicePanel,
                guideSharePanel: data.guideSharePanel,
                // thirdpartyName : data.thirdpartyName,
                createdTime: data.createdTime,
                loginBanStart: data.loginBanStart,
                loginBanEnd: data.loginBanEnd,
                isNotFollowing: data.is_not_following,
                beFollowed: data.be_followed,
                tracksCount: data.tracks_count,
                followingsCount: data.followings_count,
                followersCount: data.followers_count,
                avatarUrl60: data.avatar_url_60
            };
        },
        /// <summary>
        /// 关注/取消关注人
        /// </summary>
        /// <param name="success">成功回调</param>
        /// <param name="error">失败回调</param>
        doFollow: function (success, error) {
            var _this = this, method = "", uid = _this.get("id");

            success = success || $.noop;
            error = error || $.noop;
            method = _this.get("isNotFollowing") ? "create" : "destroy";

            _this.save(_this.toJSON(), {
                url: "/followings/" + method,
                type: "post",
                dataType: "json",
                parse: false,
                data: {
                    following_uid: uid
                },
                success: function (model, data, options) {
                    model.set("id", uid);
                    if (data.res !== false) {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                },
                error: function (model, data, options) {
                    error(model, null, options);
                }
            });
        },
        /// <summary>
        /// 关注/取消关注人
        /// </summary>
        /// <param name="success">成功回调</param>
        /// <param name="login">未登录回调</param>
        /// <param name="error">失败回调</param>
        doMutiFollow: function (success, login, error) {
            var _this = this;

            success = success || $.noop;
            error = error || $.noop;
            login = error || $.noop;

            _this.save({}, {
                url: "/followings/group_create",
                type: "post",
                dataType: "json",
                data: {
                    list: _this.get("ids").join(',')
                },
                success: function (model, data, options) {
                    if (data["message"] == "create") {
                        var users = _this.cache.getCachedByIds(_this.get("ids"));
                        if (users && users.models.length) {
                            users.each(function () {
                                var user = this;
                                user.set("isNotFollowing", !user.get("isNotFollowing"));
                            });
                        }
                        success(model, data, options);
                    } else if (data["message"] == "login") {
                        login(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        /// 删除粉丝
        /// </summary>
        /// <param name="success">成功回调</param>
        /// <param name="error">失败回调</param>
        doRemoveFans: function (success, error) {
            var _this = this;

            success = success || $.noop;
            error = error || $.noop;
            _this.save({}, {
                url: "/followers/destroy",
                type: "post",
                dataType: "json",
                data: {
                    uid: _this.get("id")
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
        /// 修改签名
        /// </summary>
        /// <param name="success">成功回调</param>
        /// <param name="error">失败回调</param>
        doChangeDes: function (success, error) {
            var _this = this;

            success = success || $.noop;
            error = error || $.noop;
            _this.save({}, {
                url: "/passport/modifySignature",
                type: "post",
                dataType: "json",
                data: {
                    personalSignature: _this.get("personalSignature")
                },
                success: function (model, data, options) {
                    if (data.success === true) {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        },
        /// <summary>
        /// 修改地区
        /// </summary>
        /// <param name="success">成功回调</param>
        /// <param name="error">失败回调</param>
        doChangeArea: function (success, error) {
            var _this = this;

            success = success || $.noop;
            error = error || $.noop;
            _this.save({}, {
                url: "/passport/profile/location/save",
                type: "post",
                dataType: "json",
                data: {
                    province: _this.get("province"),
                    city: _this.get("city")
                },
                success: function (model, data, options) {
                    if (data.success === true) {
                        success(model, data, options);
                    } else {
                        error(model, data, options);
                    }
                }
            });
        }
    }, {
        cache: new Cache({
            keys: ["nickname"]
        })
    });
    return Model;
});