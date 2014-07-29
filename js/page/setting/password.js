/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-8-21
 * Time: 下午5:37
 * To change this template use File | Settings | File Templates.
 */
define(["jquery",
    'page/page_base',
    'model/setting',
    'plugin/dialog',
    'plugin/validator'],function($,  PageBase, SettingModel, dialog, validator){

    var Page = PageBase.extend({
        model: new SettingModel(),
        init: function () {
            this.callParent("init");
            if(window.msg){
                dialog.alert(msg);
            }
            this.bindEvents();
        },
        bindEvents: function () {
            var old_pwd = $("#old_pwd"),
                new_pwd = $("#new_pwd"),
                new_pwd_repeat = $("#confirm_pwd"),
                submit_btn = $("#confirmBtn"),
                new_pwd_val = "",
                old_pwd_ok = false,
                new_pwd_ok = false,
                new_pwd_repeat_ok = false;

            if(old_pwd.size()==0){
                old_pwd_ok = true;
            }else{
                old_pwd.bind({
                    blur:function(){
                        if(checkLength(this)){
                            old_pwd_ok = true;
                            showRightTip($(this));
                        }else{
                            old_pwd_ok = false;
                        }
                    },
                    focus:function(){
                        showTip(old_pwd);
                    }
                });
            }

            new_pwd.bind({
                blur:function(){
                    var $input = $(this);
                    if(checkLength(this)){
                        new_pwd_val =$input.val();
                        new_pwd_ok = true;
                        showRightTip($input);
                    }else{
                        new_pwd_ok = false;
                    }
                },
                focus:function(){
                    showTip(new_pwd);
                }
            });
            new_pwd_repeat.bind({
                blur:function(){
                    var $input = $(this);
                    if(checkLength(this)){
                        if(new_pwd_val != $input.val()){
                            showErrorTip($input, "两次输入的密码不一致");
                            new_pwd_repeat_ok = false;
                        }else{
                            new_pwd_repeat_ok = true;
                            showRightTip($input);
                        }
                    }else{
                        new_pwd_repeat_ok = false;
                    }
                },
                focus:function(){
                    showTip(new_pwd_repeat);
                }
            });
            function checkLength(dom){
                var input = $(dom),
                    val = input.val();
                var len = val.length;
                if(len<6 || len >16){
                    showErrorTip(input, "密码长度不正确");
                    return false;
                }else if(validator.validator(val, "include_chinese")){
                    showErrorTip(input, "密码请勿使用特殊字符");
                    return false;
                } else{
                    hideTip(input);
                }
                return true;
            }

            submit_btn.click(function(){
                if(checkPwd()){
                    submit_btn.closest("form").submit();
                }
            });

            function checkPwd(){
                if(old_pwd.size() !=0){
                    old_pwd.triggerHandler("blur");
                }
                new_pwd.triggerHandler("blur");
                new_pwd_repeat.triggerHandler("blur");
                if(old_pwd_ok && new_pwd_ok && new_pwd_repeat_ok){
                    return true;
                }
                return false;
            }
            function showErrorTip(el, msg){
                var $dl =  el.parents(".set_dl");
                $dl.removeClass("is-correct").addClass("is-error");
                $dl.find(".error").html(msg);
                hideTip(el);
            }
            function showRightTip(el){
                var $dl =  el.parents(".set_dl");
                $dl.addClass("is-correct").removeClass("is-error");
                hideTip(el);
            }
            function showTip(el){
                el.parents(".set_dl").removeClass("is-error is-correct");
                el.parents(".set_dl").find(".set_hint").show();
            }
            function hideTip(el){
                el.parents(".set_dl").find(".set_hint").hide();
            }
        },

        release: function () {
            this.callParent("release");
        }
    });
    var page = new Page();
    return page;

});