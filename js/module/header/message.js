/*
* 
* 
* 
* 
* 
* 
*/
define(["jquery", "json2", "model/message", "plugin/dialog", "helper"], function ($, JSON, messageModel, plugin) {
    var a = $("div.login-msg");
    var b = $(".loginPanel_MsgPop ul");
    var c = {
        newComment: "<li><a category=\"new_comment\" href='/#/msgcenter/comment'>{0}条新评论</a></li>",
        newQuan: "<li><a category=\"new_quan\" href='/#/msgcenter/referme'>{0}个人@了你</a></li>",
        newFollower: "<li><a category=\"new_follower\" href='/#/{1}/fans'>{0}个新粉丝</a></li>",
        newNotice: "<li><a category=\"new_notice\" href='/#/msgcenter/notice'>{0}个系统通知</a></li>",
        newMessage: "<li><a category=\"new_message\" href='/#/msgcenter/letter'>{0}封私信</a></li>",
        newLikes: "<li><a category=\"new_like\" href='/#/msgcenter/like'>{0}个喜欢通知</a></li>"
    };

    /// <summary>
    ///	获得用户最新消息
    /// </summary>
    var messageWarn = {
        isRequist: false, //是否读取cookies
        seqID: 0,
        locked:false,
        messageModel: null,
        /// <summary>
        ///	启动消息队列
        /// </summary>
        start: function () {
            this.messageModel = new messageModel();
            this.messageModel.on("change:newMessage", this.onChangeCount, this);
            this.messageModel.on("change:newComment", this.onChangeCount, this);
            this.seqID = setInterval(function () {
                messageWarn.seqMessage();
            }, config.WARNING_SEQ * 1000); //
        },
        onChangeCount: function (model) {
            var count = model.get("newMessage") + model.get("newComment");

            if (count > 0) {
                $(".homeNavMoreBar .navNumIcon em").text(count);
                $(".homeNavMoreBar .navNumIcon").show();
            } else {
                $(".homeNavMoreBar .navNumIcon").hide();
            }
            if (model.get("newMessage") > 0) {
                $(".message .navNumIcon em").text(model.get("newMessage"));
                $(".message .navNumIcon").show();
            } else {
                $(".message .navNumIcon").hide();
            }
            if (model.get("newComment") > 0) {
                $(".comment .navNumIcon em").text(model.get("newComment"));
                $(".comment .navNumIcon").show();
            } else {
                $(".comment .navNumIcon").hide();
            }
        },
        /// <summary>
        ///	获取消息
        /// </summary>
        seqMessage: function () {
            //判断用户是否登录
            if (!helper.isLogin()) {
                return;
            }
            if (!messageWarn.isRequist) {
                //判断是否已经启用了消息机制，使用cookies实现
                var msgwarn = $.cookie('msgwarn');
                if (msgwarn) {
                    messageWarn.doResetmsg(new messageModel(JSON.parse(msgwarn)));
                    return;
                }
            }
            messageWarn.isRequist = true;
            //读服务器数据
            messageWarn.messageModel.getNewMessage(function (model, data) {
                messageWarn.isRequist = true;
                data = model.toJSON();
                $.cookie('msgwarn', JSON.stringify(data), { expires: config.WARNING_SEQ * 1 + 3 });
                messageWarn.doResetmsg(model);
            });
        },
        /// <summary>
        ///	关闭所有的消息
        /// </summary>
        closeAllCate: function () {
            messageWarn.messageModel.set("category", undefined);
            messageWarn.messageModel.clearNewMessage(function (data) {
                b.parent().hide();
            });

            return false;
        },
        /// <summary>
        ///	关闭单个的消息
        /// </summary>
        closeCate: function () {
            var _this = this;

            $(_this).parent().remove();
            if (b.find("a[category]").length == 0) {
                b.parent().hide();
            }
            location.href = $(_this).attr("href");
            messageWarn.messageModel.set("category", $(_this).attr("category"));
            messageWarn.messageModel.clearNewMessage();

            return false;
        },
        /// <summary>
        ///	处理消息数据
        /// </summary>
        /// <param name="model">数据模型</param>
        doResetmsg: function (model) {
            var isEuealZero = true;

            b.find("li").remove();
            for (var attr in model.attributes) {
                if (attr in c) {
                    if (model.attributes[attr] > 0) {
                        isEuealZero = false;
                        b.append(helper.strFormat(c[attr], model.attributes[attr], config.CURRENT_USER.uid));
                    }
                }
            }
            if (isEuealZero) {
                b.parent().hide();
            } else {
                if (!a.hasClass("show") && messageWarn.locked==false) {
                    b.parent().show();
                }
                b.find("a[category]").off().on("click", messageWarn.closeCate);
                b.parent().find("div.del").off().on("click", messageWarn.closeAllCate);
            }
        }
    };

    return messageWarn;
});