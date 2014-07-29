/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-8-9
 * Time: 下午5:19
 * To change this template use File | Settings | File Templates.
 */

define(['jquery', 'helper', 'plugin/dialog', 'plugin/placeholder', 'module/dialogs/city', "model/user"],
    function ($, helper, dialog, placeholder, city, user) {
        var domain_passport2 = config.PASSPORT_DOMAIN || "/passport";
        var check_email_url = domain_passport2 + "/guider/profile/checkEmail"; //get
        var check_nickname_url = domain_passport2 + "/guider/profile/checkNickname"; //get
        var login_check_url = domain_passport2 + "/login/checkAccount";
        //var friends_paged_url = domain_passport2 +"/guider/friends/paged";
        var register_url = domain_passport2 + "/register";
        var login_url = domain_passport2 + "/popupLogin";
        var regexEnum =
        {
            email: /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/, //邮件
            url: /^http[s]?:\/\/([\w\-]+\.)+[\w\-]+([\w\-.\/\?\%\&\=\#]*)?$/, //url
            chinese: /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/, //仅中文
            include_chinese: /[\u4E00-\u9FA5\uF900-\uFA2D]/g,
            mobile: /^1[0-9]{10}$/, //手机
            qq: /^[1-9]*[1-9][0-9]*$/, //QQ号码
            username: /^\w+$/, //用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
            illchar: /[\~\`\!\@\#\$\%\^\&\*\(\)\-\=\+\\\|\'\"\;\:\.\>\,\<\/\?\~\·\！\@\#\￥\%\…\…\&\*\（\）\—\—\-\+\=\|\\\}\]\{\[\"\'\:\;\?\/\>\.\<\,]/
        };
        var validator = function (value, type) {
            var returnValue = false;
            if (regexEnum[type]) {
                if (regexEnum[type].test(value)) {
                    returnValue = true;
                }
            }
            return returnValue;
        };
        var body_str_temp = "";
        var login_box = {
            open: function (callback) {
                this.callback = callback || function(){
                    window.location.reload();
                };
                this.openInit();

            },
            setFollowsId: function (uid) {
                helper.cookie.addCookie("j_follow_id", uid);
            },
            getFollowsId: function () {
                var id = helper.cookie.getCookie("j_follow_id");
                helper.cookie.delCookie("j_follow_id");
                return id;
            },
            setLikeSoundId: function (track_id) {
                helper.cookie.addCookie("j_like_sound_id", track_id);
            },
            getLikeSoundId: function () {
                var id = helper.cookie.getCookie("j_like_sound_id");
                helper.cookie.delCookie("j_like_sound_id");
                return id;
            },
            getLocation: function () {
                var _this = this;
                $.ajax({
                    url: "/passport/location",
                    type: "get",
                    data: {},
                    dataType: "json",
                    success: function (result) {
                        if (result.success) {
                            _this.setLocation(result.location);
                        } else {
                            _this.setLocation("");
                        }
                    }
                });
            },
            setLocation: function (location) {
                this.el.find("#city_info").html(location);
                this.el.find("#register_province").val(location);
            },
            openBox: function (target) {
                var body_str = "";
                if (body_str_temp) {
                    body_str = body_str_temp;
                } else {
                    var login_from =
                        '<form action="">' +
                            '<div class="formList">' +
                            '<div class="formItem item_in">' +
                            '<span class="sp_name">' +
                            '<label for="userAccount">账号</label>' +
                            '</span>' +
                            '<span class="ph_input">' +
                            '<input type="text" placeholder="手机号/邮箱" style="" id="login_userAccount" name="userAccount">' +
                            '</span><span class="sp_tip"></span>' +
                            '<div class="error">该用户名已被使用</div></div>' +
                            '<div class="formItem item_in">' +
                            '<span class="sp_name">' +
                            '<label for="userPwd">密码</label></span>' +
                            '<span class="ph_input">' +
                            '<input type="password" id="login_userPwd" name="userPwd">' +
                            '</span><div id="login_error" class="login_error"><!--您的密码或者账号有误-->&nbsp; </div></div>' +
                            '<div class="formItem loginBtm">' +
                            '<input type="checkbox" checked="checked" class="userRemember" id="login_userRemember" name="userRemember">' +
                            '<label for="">记住登录状态</label><a href="/passport/user_info/show" class="a_1">找回密码</a>' +
                            '<a class="confirmBtn" id="login_btn">登录</a>' +
                            '</div></div></form>';


                    var reg_from =
                        '<form action="/passport/register" method="post">' +
                            '<input type="hidden" value="上海" id="register_province">' +
                            '<input type="hidden" id="register_city">' +
                            '<div class="formItem item_in">' +
                            '<span class="sp_name"><label for="nickName">昵称</label></span>' +
                            '<span class="ph_input">' +
                            '<input type="text" placeholder="想一个20个字符以内的昵称" id="register_nickName" name="nickname">' +
                            ' </span>' +
                            '<span class="sp_tip"></span>' +
                            '<div class="error">该用户名已被使用</div>' +
                            '</div>' +
                            '<div class="formItem item_in">' +
                            '<span class="sp_name"><label for="userAccount">邮箱</label></span>' +
                            '<span class="ph_input">' +
                            '<input type="text" placeholder="选择一个您常用的邮箱" id="register_userAccount" name="email">' +
                            '</span>' +
                            '<span class="sp_tip"></span>' +
                            '<div class="error"></div>' +
                            '</div>' +
                            '<div class="formItem item_in">' +
                            '<span class="sp_name"><label for="userPwd">密码</label></span>' +
                            ' <span class="ph_input">' +
                            '<input type="password" placeholder="请输入6-16位密码" id="register_userPwd" name="password">' +
                            '</span>' +
                            '<span class="sp_tip"></span>' +
                            '<div class="error"></div>' +
                            '</div>' +
                            '<div class="formItem regBtm">' +
                            '<div class="fl">' +
                            '<input type="checkbox" checked="checked" class="ck_1" id="register_agreeDeal" name="">' +
                            '<label>我已看过并同意</label><br>' +
                            '<a href="javascript:;" id="register_deal_info" class="a_1">《喜马拉雅网络服务使用协议》</a>' +
                            '<span class="register_error" id="register_infoErr"></span>' +
                            '</div>' +
                            '<div class="fr">' +
                            '<a class="confirmBtn" id="register_btn">注册</a>' +
                            '</div>' +
                            '</div>' +
                            '</form>';


                    body_str =
                        '<a class="thirdParty">' +
                            '<span class="loginSinaIcon"></span><span class="loginQqIcon"></span><span>使用第三方登录</span>' +
                            '</a>' +
                            '<div class="reg_login_form_wrap '+target+'">' +
                            '<div class="reg_login_tabs">' +
                            '<a class="login_tab_btn">登录</a>' +
                            '<a class="register_tab_btn">注册</a>' +
                            '</div>' +
                            '<div class="reg_login_from">' +
                            '<div class="login_from">' +
                            login_from +
                            '</div>' +
                            '<div class="reg_from">' +
                            reg_from +
                            '</div>' +
                            '</div>' +
                            '</div>';
                    //body_str_temp = body_str;
                }

                var op = {
                    dialogClass: "reglogin",
                    content: body_str,
                    template: {
                        dialog_container: '<div class="loginPop" dialog-role="container"></div>',
                        dialog_close: '<a class="close5Btn" dialog-role="close"></a>'
                    }
                };

                var popup = new dialog.Dialog(op);
                this.popup = popup;
                popup.open();
                var el = popup.getEl();
                //var from = el.find(".reg_login_from");
                el.find(".reg_login_tabs a").click(function () {
                    var a = $(this);
                    var idx = a.index(),
                        $wrap = el.find(".reg_login_form_wrap");
                    if(idx ==1 ){
                       $wrap.addClass('is-reg');
                    }else{
                        $wrap.removeClass('is-reg');
                    }
                });
                var _this = this;
                el.find(".thirdParty").on("click", function(){
                    popup.close();
                    _this.openInit();
                });
                var changeCity = el.find("#changeCity");
                changeCity.click(function () {
                    if (changeCity.attr("forbidden")) return;
                    changeCity.attr("forbidden", true);

                    if (!city) return;
                    city.open(function (pro, ct) {
                        $("#city_info").html(pro + ct);
                        $("#register_province").val(pro);
                        $("#register_city").val(ct);
                        changeCity.removeAttr("forbidden");
                    });

                });
                this.el = el;
                this.getLocation();
                this.thirdParty(el);
                this.login();
                this.register();
            },
            openInit: function () {
                var body_html =
                    '<div class="loginPop_tit"></div>' +
                        '<div class="left">' +
                        '<div class="loginPop_pic"></div>' +
                        '</div>' +
                        '<div class="right">' +
                        '<div>' +
                        '<a class="qqLoginBtn2" href="javascript:;" data-baidu="QQ1"></a>' +
                        '<a class="weiboLoginBtn2" href="javascript:;" data-baidu="weibo1"></a>' +
                        '</div>' +
                        '<div>没有以上账号？<a class="register" href="javascript:;" data-baidu="register1">直接注册</a></div>' +
                        '<div>以前来过这里？<a class="login" href="javascript:;" data-baidu="login1">立即登录</a></div>' +
                        '<div>不记得密码了？<a  href="/passport/user_info/show" >找回密码</a></div>' +
                        '</div>';
                var op = {
                    content: body_html,
                    template: {
                        dialog_container: '<div class="loginPop" dialog-role="container"></div>',
                        dialog_body: '<div class="loginPopInner" dialog-role="body"></div>',
                        dialog_close: '<div class="close5Btn" dialog-role="close"></div>'
                    }
                };

                var popup = new dialog.Dialog(op);
                this.popup = popup;
                popup.open();
                var el = popup.getEl(),
                    _this = this;
                el.find(".register").click(function () {
                    _this.baidu($(this));
                    popup.close();
                    _this.openBox('is-reg');
                });
                el.find(".login").click(function () {
                    _this.baidu($(this));
                    popup.close();
                    _this.openBox('');
                });
                this.thirdParty(el);
            },
            thirdParty: function (el) {
                var _this = this;
                el.find(".qqLoginBtn2, .weiboLoginBtn2").click(function () {
                    var $a = $(this);
                    _this.baidu($a);
                    var num = $a.index() + 1;
                    helper.login(num, "", function (data) {
                        _this.login_callback(data);
                    });
                });
            },
            login_callback: function (data) {
                var _this = this;
                var uid = _this.getFollowsId();
                if (!config.CURRENT_USER) {
                    config.CURRENT_USER = {};
                }
                if (!config.CURRENT_USER.uid) {
                    config.CURRENT_USER.uid = uid;
                }

                if (uid) {
                    user.follow(uid, true, function () {
                        _this.callback(data);
                    });
                } else {
                    _this.callback(data);
                }
                this.close();
            },
            baidu: function ($el) {
                var data = $el.attr("data-baidu");
                if (window.console) console.log(data);
                if (window._hmt) {
                    _hmt.push(['_trackEvent', data, 'click']);
                }
            },
            login: function () {
                placeholder(".login_from .ph_input");
                var gMsg = {
                    userError: "账号格式不正确!",
                    noUser: "该账号尚未注册!",
                    pwdError: "该账号密码不正确!",
                    userEmpty: "请输入账号!",
                    pwdEmpty: "请输入密码!"
                };
                var $userAccount = this.el.find("#login_userAccount "),
                    $userPwd = this.el.find("#login_userPwd"),
                    $userRemember = this.el.find("#login_userRemember"),
                    $login_btn = this.el.find("#login_btn");

                $userAccount.blur(function () {
                    if ($(this).attr("cancel_blur")) {
                        return;
                    }
                    verify.account($(this));
                });
                /*   todo
                 $userAccount..MailAutoComplete({onInitialize:function(){
                 $userAccount.attr("cancel_blur", true);
                 },onComplete:function(res){
                 $userAccount.removeAttr("cancel_blur");
                 if(res && !res.complete){
                 $userAccount.blur();
                 }
                 }});*/
                $userPwd.blur(function () {
                    if (verify.accountSuccess) {
                        verify.password($(this));
                    }
                });
                var _this = this;
                var verify = {
                    accountSuccess: false,
                    passwordSuccess: false,
                    account: function (input) {
                        this.accountSuccess = false;
                        var val = input.val();
                        if (!val) {
                            this.error(input, gMsg.userEmpty);
                            return;
                        }
                        if (!validator(val, "email") && !validator(val, "mobile")) {
                            this.error(input, gMsg.userError);
                            return;
                        }
                        var _this = this;
                        $.ajax({
                            url: login_check_url,
                            type: "post",
                            dataType: "json",
                            data: {email: val},
                            success: function (result) {
                                if (result.success) {
                                    _this.accountSuccess = true;
                                    _this.success();
                                } else {
                                    var msg = "";
                                    if (result.msg) msg = result.msg;
                                    _this.error(input, msg);
                                }
                            },
                            error: function () {
                                _this.error(input, '真不幸，服务器貌似打酱油去了');
                            }
                        });

                    },
                    password: function (input) {
                        var val = input.val();
                        if (!val) {
                            this.error(input, gMsg.pwdEmpty);
                            return;
                        }
                        this.passwordSuccess = true;
                        this.success();
                    },
                    error: function (input, msg) {
                        var $sp_tip = _this.el.find("#login_error");
                        $sp_tip.html(msg);

                    },
                    success: function () {
                        var $sp_tip = _this.el.find(".login_error");
                        $sp_tip.html("&nbsp;");
                    }
                };
                $(".formList input[type=password]").bind({
                    keydown: function (event) {
                        if (event.keyCode == 13) {
                            $(this).triggerHandler("blur");
                            $login_btn.click();
                        }
                    }
                });
                $login_btn.click(function () {
                    if (!verify.accountSuccess) {
                        verify.account($userAccount);
                    } else if (!verify.passwordSuccess) {
                        verify.password($userPwd);
                    }
                    if (verify.accountSuccess && verify.passwordSuccess) {
                        $.post(login_url,
                            {
                                account: $.trim($userAccount.val()),
                                password: $.trim($userPwd.val()),
                                rememberMe: $userRemember[0].checked ? true : false
                            },
                            function (data) {
                                if (data.success) {
                                    _this.login_callback(data);
                                    verify.success();
                                } else {
                                    verify.error("", data.errorMsg);
                                }
                            }, "json");
                    }
                });
            },

            close: function () {
                if (this.popup) {
                    this.popup.close();
                }
            },
            getEl: function () {
                if (this.popup) {
                    return this.popup.getEl();
                }
                return "";
            },
            register: function () {
                $("#register_deal_info").click(function () {

                    $.get("/passport/register_rule", function (result) {
                        var body_str =
                            '<div class="for" style="height:600px;overflow-y: scroll;">' +
                                result +
                                '</div>';
                        var op = {
                            dialogClass: "",
                            caption: "喜马拉雅网络服务使用协议",
                            content: body_str,
                            width: 680
                        };

                        var pup = new dialog.Dialog(op);
                        pup.open();
                    });

                });
                var gMsg = {
                    emailExist: "该邮箱已被注册",
                    emailFormatError: "账号格式错误，请输入邮箱",
                    emailLengthError: "账号长度不能超过30个字符",
                    nameIll: "昵称包含非法字符",
                    nameTooShort: "昵称过短",
                    nameTooLong: "昵称过长",
                    nameExist: "该昵称已有人使用",
                    pwdTooShort: "密码不能短于6位",
                    pwdTooLong: "密码不能长于16位",
                    emailEmpty: "注册邮箱必填",
                    pwdEmpty: "密码必填",
                    pwdIll: "密码请勿使用特殊字符",
                    nameEmpty: "昵称必填",
                    dealEmpty: "请先同意用户协议"
                };
                placeholder(".reg_from .ph_input");
                var $nickName = this.el.find("#register_nickName"),
                    $userAccount = this.el.find("#register_userAccount"),
                    $userPwd = this.el.find("#register_userPwd"),
                    $agreeDeal = this.el.find("#register_agreeDeal"),
                    $infoErr =this.el.find("#register_infoErr"),
                    $login_btn = this.el.find("#register_btn");

                $nickName.blur(function () {
                    verify.name($(this));
                });
                $userAccount.blur(function () {
                    if ($(this).attr("cancel_blur")) {
                        return;
                    }
                    verify.account($(this));
                });
                /*    todo
                 $userAccount.MailAutoComplete({onInitialize:function(){
                 $userAccount.attr("cancel_blur", true);
                 },onComplete:function(res){
                 $userAccount.removeAttr("cancel_blur");
                 if(res && !res.complete){
                 $userAccount.blur();
                 }
                 }});*/
                $userPwd.blur(function () {
                    verify.password($(this));
                });
                $agreeDeal.click(function () {
                    verify.deal();
                });
                var verify = {
                    nameSuccess: false,
                    accountSuccess: false,
                    passwordSuccess: false,
                    name: function (input) {
                        this.nameSuccess = false;
                        this.resetTip(input);
                        var val = input.val();
                        if (!val) {
                            this.error(input, gMsg.nameEmpty);
                            return;
                        }
                        //判定非法字符串
                        var res = validator(val, "illchar");
                        if (res) {
                            this.error(input, gMsg.nameIll);
                            return;
                        }
                        //汉字转字母 求长度
                        var val_tmp = val;
                        val_tmp = val_tmp.replace(regexEnum['include_chinese'], "aa");
                        var len = val_tmp.length;
                        if (len < 4) {
                            this.error(input, gMsg.nameTooShort);
                            return;
                        }
                        if (len > 20) {
                            this.error(input, gMsg.nameTooLong);
                            return;
                        }

                        var _this = this;
                        $.ajax({
                            url: check_nickname_url,
                            type: "post",
                            dataType: "json",
                            data: {nickname: val},
                            success: function (result) {
                                if (result.success) {
                                    _this.nameSuccess = true;
                                    _this.success(input);
                                } else {
                                    _this.error(input, result.msg);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                serverError(jqXHR, textStatus, errorThrown);
                            }
                        });
                        /*this.nameSuccess = true;
                         this.success(input);*/
                    },
                    account: function (input) {
                        this.accountSuccess = false;
                        this.resetTip(input);
                        var val = input.val();
                        if (!val) {
                            this.error(input, gMsg.emailEmpty);
                            return;
                        }
                        if (!validator(val, "email")) {
                            this.error(input, gMsg.emailFormatError);
                            return;
                        }
                        if (val.length > 30) {
                            this.error(input, gMsg.emailLengthError);
                            return;
                        }

                        var _this = this;
                        $.ajax({
                            url: check_email_url,
                            type: "post",
                            dataType: "json",
                            data: {email: val},
                            success: function (result) {
                                if (result.success) {
                                    _this.nameSuccess = true;
                                    _this.success(input);
                                } else {
                                    _this.error(input, result.msg);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                serverError(jqXHR, textStatus, errorThrown);
                            }
                        });
                        this.accountSuccess = true;
                        this.success(input);
                    },
                    password: function (input) {
                        this.passwordSuccess = false;
                        this.resetTip(input);
                        var val = input.val();
                        if (!val) {
                            this.error(input, gMsg.pwdEmpty);
                            return;
                        }
                        var len = val.length;
                        if (len < 6) {
                            this.error(input, gMsg.pwdTooShort);
                            return;
                        }
                        if (len > 16) {
                            this.error(input, gMsg.pwdTooLong);
                            return;
                        }
                        if (validator(val, "include_chinese")) {
                            this.error(input, gMsg.pwdIll);
                            return;
                        }
                        this.passwordSuccess = true;
                        this.success(input);
                    },
                    resetTip:function(input){
                        var $item =   input.closest(".formItem");
                        $item.removeClass("is-error");
                        var $sp_tip = $item.children(".sp_tip");
                        $sp_tip.removeClass("sp_right");
                    },
                    error: function (input, msg) {
                        var $item =   input.closest(".formItem");
                        $item.addClass("is-error");
                        $item.find(".error").html(msg);
                        var $sp_tip = $item.children(".sp_tip");
                        $sp_tip.removeClass("sp_right");
                     /*   var $sp_tip = input.parents(".formItem").children(".sp_tip");
                        $sp_tip.removeClass("sp_right")
                            .addClass("sp_error")
                            .html(msg);*/

                    },
                    success: function (input) {
                        var $item =   input.closest(".formItem");
                        $item.removeClass("is-error");
                        var $sp_tip = $item.children(".sp_tip");
                        $sp_tip.addClass("sp_right");
                    },
                    deal: function () {
                        //用户完善信息 没有同意协议选项

                        if ($agreeDeal[0].checked) {
                            $infoErr.html("");
                            return true;
                        } else {
                            $infoErr.html(gMsg.dealEmpty);
                            return false;
                        }
                    }
                };

                $(".formList input[type=password]").bind({
                    keydown: function (event) {
                        if (event.keyCode == 13) {
                            $(this).triggerHandler("blur");
                            $login_btn.click();
                        }
                    }
                });

                $login_btn.click(function () {

                    if (verify.nameSuccess &&
                        verify.accountSuccess &&
                        verify.passwordSuccess &&
                        verify.deal()) {
                        $login_btn.closest("form").submit();
                    } else {
                        $nickName.blur();
                        $userAccount.blur();
                        $userPwd.blur();
                    }

                });
            }
        };

        function serverError(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                window.location.href = error_url;
            }
        }

        return login_box;
    });