/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-7
 * Time: 下午6:06
 * To change this template use File | Settings | File Templates.
 */


define(["jquery", "plugin/dialog", '../../model/setting'], function ($, dialog, PassportSettingModel) {
    var passport_setting = new PassportSettingModel();
    var sync = {
        open: function (callback) {
            this.callback = callback || $.noop;
            this.createPop();
        },
        createPop: function () {
            var html =
                '<dl class="mobile"><dt>手机号</dt><dd><input type="text" class="mobilenum"><div class="error">请输入正确的手机号码</div></dd>' +
                    '<dd><a class="verifycodeBtn ">发送验证码</a></dd></dl>' +
                    '<dl class="verify"><dt>验证码</dt><dd><input type="text" class="verifycode" /><div class="error">验证码错误</div></dd></dl>' +
                    '<div class="operate"><a class="confirmBtn">立即绑定</a></div>';
            var op = {
                dialogClass: "bindmobile",
                header: "绑定手机",
                content: html,
                id:"bindmobile_dialog"
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.$verifycodeBtn = this.$el.find(".verifycodeBtn");
            this.$mobile = this.$el.find(".mobile");
            this.$verify = this.$el.find(".verify");
            this.$mobileNum = this.$el.find(".mobilenum");
            this.$verifyCode = this.$el.find(".verifycode");
            this.$confirmBtn = this.$el.find(".confirmBtn");
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this,
                $el = this.$el;
            this.$verifycodeBtn.on("click", function () {
                if (_this.$verifycodeBtn.hasClass("already")) {
                    return;
                }
                _this.sendCode();
            });
            this.$mobileNum.on("focus", function(){
                _this.$mobile.removeClass("is-error");
            });
            this.$verifyCode.on("focus", function(){
                _this.$verify.removeClass("is-error");
            });
            //绑定
            this.$confirmBtn.on("click", function(){
                _this.bindPhone();
            });
        },
        phoneError:function(text){
            this.$mobile.addClass("is-error");
            this.$mobile.find(".error").html(text || "请输入正确的手机号码");
        },
        codeError:function(text){
            this.$verify.addClass("is-error");
            this.$verify.find(".error").html(text || "验证码错误");
        },
        bindPhone:function(){
            var _this = this,
                num = $.trim(this.$mobileNum.val()),
                code =  $.trim(this.$verifyCode.val());
            if(!this.checkPhone(num)){
                this.phoneError();
                return;
            }
            if(!code){
                this.codeError();
                return;
            }
            passport_setting.bindPhone(num, code, function(result){
                _this.callback(result);
                _this.pop.close();
                clearInterval(_this.holdTimer);
            }, function(result){
                _this.codeError();
            });
        },
        checkPhone: function (num_str) {
            num_str = $.trim(num_str);
            return /^1(([358][0-9])|(4[57]))[0-9]{8}$/.test(num_str);
        },
        sendCode: function () {
            var _this = this,
                num = $.trim(this.$mobileNum.val()),
                $verifycodeBtn = _this.$el.find(".verifycodeBtn");
            if(!this.checkPhone(num)){
                this.$mobile.addClass("is-error");
                return;
            }

            if($verifycodeBtn.hasClass("already")){
                return;
            }
            var holdTimer = 0;
            var holdSend = function(time){
                $verifycodeBtn.addClass("already").html("已发送("+time+")");

                clearInterval(holdTimer);
                holdTimer = setInterval(function(){
                    time--;
                    if(time <=0){
                        $verifycodeBtn.html("发送验证码");
                        $verifycodeBtn.removeClass("already");
                        clearInterval(holdTimer);
                        return;
                    }
                    $verifycodeBtn.html("已发送("+time+")");
                },1000);
                _this.holdTimer = holdTimer;
            };

            var holdTime = 180;
            passport_setting.mobileVerifyCode(num, function (response) {
                holdSend(holdTime);
            }, function (response) {
                if(!response.time){
                   _this.phoneError(response.msg || "服务器繁忙,请稍后再试!");
                    return;
                }

                _this.phoneError(response.msg);
                var time = holdTime - parseInt(response.time/1000);
                if(time>0){
                    holdSend(time);
                }
            });
        }
    };
    return sync;
});
