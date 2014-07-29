/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午2:35
 * To change this template use File | Settings | File Templates.
 */

define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
    var Model = Backbone.Model.extend({
        regMobileCode:function(phone_num, success, error){
            var url = "/passport/mobile/getVerifyCode";
            this.set("postData", {"phone_num": phone_num ,msgType:4});
            this.ajax(url, success, error);
        },
        //注册昵称检查
        regUserCheck:function(){
            var url = "/passport/guider/profile/checkEmail";
            this.set("postData", {email: val} );
            this.ajax(url, success, error);
        },
        regNickNameCheck:function(val, success, error){
            //get
            var url = "/passport/guider/profile/checkNickname";
            this.set("postData", {nickname: val} );
            this.ajax(url, success, error);
        },
        //登录时帐号检查
        loginUserCheck:function(user, success, error){
            var url = "/passport/login/checkAccount";
            this.set("postData", {email: user});
            this.ajax(url, success, error);
        },
        login:function(account, password, rememberMe, success, error){
             var url = "/passport/popupLogin";
            this.set("postData",  {
                account:account,
                password:password,
                rememberMe:rememberMe
            });
            this.ajax(url, success, error);
        },
        ajax:function(url, success, error, isGet){
            success = success || $.noop;
            error = error || $.noop;
            var data = this.get("postData");
            $.ajax({
                url:url,
                type:isGet?"get":"post",
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