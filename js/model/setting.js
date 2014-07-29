/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午4:43
 * To change this template use File | Settings | File Templates.
 */
define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
    var Model = Backbone.Model.extend({
        //消息设置保存
        message:function(success, error){
            var url = "/personal_settings/update_message";
            this.ajax(url, success, error);
        },
        //添加黑名单
        addBackList:function(uid, success, error){
            var url = "/home/add_to_blacklist";
            this.set("postData", {uid:uid});
            this.ajax(url, success, error);
        },
        //接触黑名单
        removeBackList:function(uid, success, error){
            var url = "/home/remove_from_blacklist";
            this.set("postData", {uid:uid});
            this.ajax(url, success, error);
        },
        //个人设置 保存
        personal:function(success, error){
            var url = "/passport/modifyProfile";
            this.ajax(url, success, error);
        },
        //隐私设置 保存
        privacy:function(success, error){
            var url = "/personal_settings/update_privacy";
            this.ajax(url, success, error);
        },
        //重发验证邮件
        reSendActive:function(success, error){
            var url = "/passport/resendactive";
            this.set("postData", {});
            this.ajax(url, success, error);
        },
        //手机获取验证码
        mobileVerifyCode:function(phone, success, error){
            var url = "/passport/mobile/getVerifyCode";
            this.set("postData", {"phone_num":phone, "serial":2, msgType:3});
            this.ajax(url, success, error);
        },
        bindPhone:function(phone, code, success, error){
            var url = "/passport/mobile/verifyCode";
            this.set("postData", {"phone_num":phone,"content":code, "serial":2});
            this.ajax(url, success, error);
        },
        bindEmail:function(email, success, error){
            var url = "/passport/profile/modifyEmail";
            this.set("postData", {email:email});
            this.ajax(url, success, error);
        },
        //检查昵称可用
        checkNickname:function(name, success, error){
            var url = "/passport/profile/checkNickname";
            this.set("postData", {nickname:name});
            this.ajax(url, success, error);
        },
        //个人中心 背景图
        background:function(data, success, error){
            var url = "/passport/background/save";
            this.set("postData", data);
            this.ajax(url, success, error);
        },
        ajax:function(url, success, error){
            success = success || $.noop;
            error = error || $.noop;
            var data = this.get("postData");
            $.ajax({
                url:url,
                type:"post",
                dataType:"json",
                data:data,
                success:function(result){
                    if(result.result == 'success' || result.success){
                        success(result);
                    }else{
                        error(result);
                    }
                },
                error:function(result){
                    error(result);
                }
            });
        }
    });
    return Model;
});
