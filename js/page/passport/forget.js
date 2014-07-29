/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-8-30
 * Time: 下午3:15
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/validator", "plugin/placeholder", 'module/foot'], function ($, validator, placeholder) {
    placeholder(".ph_input");
    var check_email_url = (window.domain_passport || "/passport")+ "/guider/profile/checkEmail",
        form_email_url = "/passport/sendResetMail",
        form_phone_url = "/passport/user_info/send",
        re_send_url = "/passport/user_info/send";


    var forget = {};
    forget.account = function(){
        var input = $("#userAccount"),
            tip = $(".sp_tip"),
            submit_btn = $("#submit_btn"),
            forget_form = $("#forget_form"),
            serial = $("#serial");

        var email_name = "email",
            phone_name = "phone_num",
            email_serial = "1",
            phone_serial = "2";

        var success = false;
        input.bind({
            "keydown keypress":function(e){
                if(e.keyCode==13){
                    checkSuccess();
                    if(success){
                        submit_btn[0].form.submit();
                    }
                    return false;
                }
            },
            blur:function(){
                checkSuccess();
            },
            focus:function(){
                tip.hide();
            }
        });
        	// 验证表单用validator  
         function checkSuccess(){
             tip.removeClass("sp_right").addClass("sp_error");
             var val = input.val();
             if(!val){
                 tip.html("请输入帐号").show();
                 return;
             }
             var flag = false;
             if (validator.validator(val, "email")){
                 forget_form.attr("action", form_email_url);
                 input.attr("name", email_name);
                 serial.val(email_serial);
                 flag = true;
             }
             if(validator.validator(val, "mobile")) {
                 forget_form.attr("action",form_phone_url);
                 input.attr("name", phone_name);
                 serial.val(phone_serial);
                 flag = true;
             }
             if(!flag){
                 tip.html("帐号格式不正确").show();
                 return;
             }
             tip.removeClass("sp_error").addClass("sp_right");
             success = true;
         }

        submit_btn.click(function(){
            if(success){
                this.form.submit();
            }else{
                checkSuccess();
            }

        });
    };
    forget.password = function (isPhone, code_input, code_error) {
        var $password = $("#password"),
            $re_password = $("#re_password"),
            submit_btn = $("#submit_btn");

        var password_ok = false,
            re_password_ok = false;
        $password.bind({
            blur:function () {
                password_ok = false;
                var _this = $(this);
                var val = _this.val();
                if (val.length < 6 || val.length > 16) {
                    error_tip(_this, "请输入6-16位密码");
                    return;
                }
                if (validator.validator(val, "include_chinese")) {
                    error_tip(_this, "密码请勿使用特殊字符");
                    return;
                }
                success_tip(_this);
                password_ok = true;
            },
            focus:function () {
            }
        });
        $re_password.bind({
            blur:function () {
                re_password_ok = false;
                var _this = $(this);
                var val = _this.val();
                if (val.length < 6 || val.length > 16) {
                    error_tip(_this, "请输入6-16位密码");
                    return;
                }
                if (val != $password.val()) {
                    error_tip(_this, "两次输入的密码不一致");
                    return;
                }
                success_tip(_this);
                re_password_ok = true;
            }
        });


        submit_btn.click(function () {
            if(isPhone&&code_input&& code_error){
                if(!code_input.val()){
                    code_error.html("请输入验证码");
                    return;
                }

            }
            if (password_ok && re_password_ok) {
                this.form.submit();
            } else {
                $password.blur();
                $re_password.blur();
            }
        });
    };
    forget.phone = function(){
        //点击重发
        var sending = false,
            time_ms = Number($("#time").val()),
            interval_timer = 0,
            hold_time = 60* 3,
            $send_code = $("#send_code"),
            $re_send = $("#re_send"),
            $infoErr = $("#infoErr"),
            phone_num = $("#phoneNum").val();

        var  time = 0;
        if(!isNaN(time_ms)){
            time = hold_time - parseInt(time_ms/1000);
        }
        $re_send.click(function(){
            if(sending || !phone_num) return;
            $.post(re_send_url,{"phone_num": phone_num,"serial": 2}, function(){
                time = hold_time;
                holdSend();
            });
        });

        function holdSend(){
            if(time<=0){
                return;
            }
            sending = true;
            $re_send.html("点击重发("+time+")");
            interval_timer = setInterval(function(){
                if(time<=0){
                    $re_send.html("点击重发");
                    sending = false;
                    clearInterval(interval_timer);
                    return;
                }
                time--;
                $re_send.html("点击重发("+time+")");
            },1000);
        }
        holdSend();
        $send_code.focus(function(){
            $infoErr.html("");
        });
        forget.password(true, $send_code, $infoErr);
    };
    function error_tip(input, msg) {
        var $sp_tip = input.parents(".formItem").children(".sp_tip");
        $sp_tip.removeClass("sp_right")
            .addClass("sp_error")
            .html(msg);
    }

    function success_tip(input) {
        var $sp_tip = input.parents(".formItem").children(".sp_tip");
        $sp_tip.addClass("sp_right")
            .removeClass("sp_error")
            .html("");
    }
    return forget;
});