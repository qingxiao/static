/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午4:21
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
                '<div>填写自己常用邮箱地址，方便大家联系你！</div>' +
                    '<dl class="popup_dl"><dt>邮箱地址</dt>' +
                    '<dd><input type="text"><div class="error">请输入正确的邮箱</div></dd></dl>' +
                    '<div class="operate"><a class="confirmBtn">立即绑定</a></div>';
            var op = {
                dialogClass: "bindemail",
                header: "常用邮箱绑定",
                content: html
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.$input = this.$el.find("input");
            this.$popup_dl = this.$el.find(".popup_dl");
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this,
                $el = this.$el;
            $el.on("click", ".confirmBtn", function(){
                _this.bindEmail();
            });
        },
        bindEmail:function(){
            var email = $.trim(this.$input.val()),
                _this = this;
            if(!this.checkEmail(email)){
                this.emailError();
                return;
            }
            passport_setting.bindEmail(email, function(response){
                response.email = email;
                _this.callback(response);
                _this.pop.close();
            }, function(response){
                _this.emailError(response.errorCode);
            });

        },
        checkEmail:function(email){
            var reg = /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
            return reg.test(email);
        },
        emailError:function(text){
            var $popup_dl =  this.$popup_dl,
                $emailerror = $popup_dl.find(".error");
            $popup_dl.addClass("is-error");
            $emailerror.html(text || "请输入正确的邮箱");
        }
    };
    return sync;
});