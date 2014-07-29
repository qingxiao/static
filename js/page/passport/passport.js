/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-7-6
 * Time: am 11:42
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'plugin/jquery.mailcomplete', 'plugin/jquery.placeholder','module/dialogs/copyright', 'module/foot'], function ($,mac, placeholder, copyright) {
    //清空input里面的值
    // $("input[type='text']").val("");
    /*url*/
    config.NO_NOTICE = true;
    var domain_passport2 = window.domain_passport || "http://local.ximalaya.com/passport";
    var friends_url = domain_passport2 + "/guider/friends";
    var user_url = domain_passport2 + "/guider/recommend/user";

    var check_email_url = domain_passport2 + "/guider/profile/checkEmail"; //get
    var check_nickname_url = domain_passport2 + "/guider/profile/checkNickname"; //get
    var login_check_url = domain_passport2 + "/login/checkAccount";
    var friends_paged_url = domain_passport2 + "/guider/friends/paged";

    /*  var follow_url = domain_passport+"/guider/recommend"; //post*/
    var re_send_url = domain_passport2 + "/mobile/getVerifyCode";
    var check_phone_url = domain_passport2 + "/mobile/register/checkinfo";

    var skip_url = domain_passport2 + "/guider/skip";
    if(!window._hmt){
        window._hmt = [];
    }
    $("#userAccount").mailcomplete({
        onInitialize:function(){
            $("#userAccount").attr("cancel_blur", true);
         },onComplete:function(res){
                $("#userAccount").removeAttr("cancel_blur");
                if(res===false || (res && !res.complete)){
                    $("#userAccount").blur();
                }
        }
    });

    var passport = {};
    var regexEnum =
    {
        intege: /^-?[1-9]\d*$/, //整数
        intege1: /^[1-9]\d*$/, //正整数
        intege2: /^-[1-9]\d*$/, //负整数
        num: /^([+-]?)\d*\.?\d+$/, //数字
        num1: /^[1-9]\d*|0$/, //正数（正整数 + 0）
        num2: /^-[1-9]\d*|0$/, //负数（负整数 + 0）
        decmal: /^([+-]?)\d*\.\d+$/, //浮点数
        decmal1: /^[1-9]\d*.\d*|0.\d*[1-9]\d*$/, //正浮点数
        decmal2: /^-([1-9]\d*.\d*|0.\d*[1-9]\d*)$/, //负浮点数
        decmal3: /^-?([1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0)$/, //浮点数
        decmal4: /^[1-9]\d*.\d*|0.\d*[1-9]\d*|0?.0+|0$/, //非负浮点数（正浮点数 + 0）
        decmal5: /^(-([1-9]\d*.\d*|0.\d*[1-9]\d*))|0?.0+|0$/, //非正浮点数（负浮点数 + 0）
        email: /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/, //邮件
        color: /^[a-fA-F0-9]{6}$/, //颜色
        url: /^http[s]?:\/\/([\w-]+\.)+[\w-]+([\w\-.\/\?\%\&\=\#]*)?$/, //url
        chinese: /^[\u4E00-\u9FA5\uF900-\uFA2D]+$/, //仅中文
        include_chinese: /[\u4E00-\u9FA5\uF900-\uFA2D]/g,

        ascii: /^[\x00-\xFF]+$/, //仅ACSII字符
        zipcode: /^\d{6}$/, //邮编
        mobile: /^1(([358][0-9])|(4[57]))[0-9]{8}$/, //手机
        ip4: /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/, //ip地址
        notempty: /^\S+$/, //非空
        picture: /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/, //图片
        rar: /(.*)\.(rar|zip|7zip|tgz)$/, //压缩文件
        date: /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/, //日期
        qq: /^[1-9]*[1-9][0-9]*$/, //QQ号码
        tel: /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/, //电话号码的函数(包括验证国内区号,国际区号,分机号)
        username: /^\w+$/, //用来用户注册。匹配由数字、26个英文字母或者下划线组成的字符串
        letter: /^[A-Za-z]+$/, //字母
        letter_u: /^[A-Z]+$/, //大写字母
        letter_l: /^[a-z]+$/, //小写字母
        idcard: /^[1-9]([0-9]{14}|[0-9]{17})$/,    //身份证
        illchar: /[\~\`\!\@\#\$\%\^\&\*\(\)\-\=\+\\\|\'\"\;\:\.\>\,\<\/\?\~\·\！\@\#\￥\%\…\…\&\*\（\）\—\—\-\+\=\|\\\}\]\{\[\"\'\:\;\?\/\>\.\<\,]/
    };
    passport.validator = function (value, type) {
        var returnValue = false;
        if (regexEnum[type]) {
            if (regexEnum[type].test(value)) {
                returnValue = true;
            }
        }
        return returnValue;
    };
    passport.validatorLength = function (value, minLen, maxLen) {
        var returnValue = false;
        var len = value.length;
        maxLen = maxLen || minLen;
        if (minLen > maxLen) {
            var temp = minLen;
            minLen = maxLen;
            maxLen = temp;
        }
        if (len >= minLen && len <= maxLen) {
            returnValue = true;
        }
        return returnValue;
    };

    /*登录*/
    passport.login = function () {
       $(".ph_input").placeholder();
        var gMsg = {
            userError: "账号格式不正确!",
            noUser: "该账号尚未注册!",
            pwdError: "该账号密码不正确!",
            userEmpty: "请输入账号!",
            pwdEmpty: "请输入密码!",
            pwdTooShort: "密码不能短于6位",
            pwdTooLong: "密码不能长于16位"
        };
        var $userAccount = $("#userAccount"),
            $userPwd = $("#userPwd"),
        //    $userRemember = $("#userRemember"),
            $login_btn = $("#login_btn");

        $userAccount.blur(function () {
            if($(this).attr("cancel_blur")){
                return false;
            }
            verify.account($(this));

        });
        $userPwd.bind({
            blur: function () {
                if (verify.accountSuccess) {
                    verify.password($(this));
                }
            },
            focus:function(){
                if (!verify.accountSuccess){
                    verify.account($userAccount);
                }
            }
        });

        var verify = {
            accountSuccess: false,
            passwordSuccess: false,
            account: function (input, successFn) {
                var _this = this;
                if(this.checkAccountTimer){
                    clearTimeout(this.checkAccountTimer);
                }
                this.checkAccountTimer = setTimeout(function(){
                    _this.accountFn(input, successFn);
                },20);
            },
            accountFn:function(input, successFn){
                this.accountSuccess = false;
                var val = $.trim(input.val());
                if (!val) {
                    this.error(input, gMsg.userEmpty);
                    return;
                }
                if (!passport.validator(val, "email") &&
                    !passport.validator(val, "mobile")) {
                    this.error(input, gMsg.userError);
                    return;
                }
                var _this = this;
                $.ajax({
                    url: login_check_url,
                    type: "post",
                    dataType: "json",
                    data: { email: val },
                    success: function (result) {
                        if (result.success) {
                            _this.accountSuccess = true;
                            if(successFn){
                                successFn();
                            }
                            _this.success();
                        } else {
                            var msg = "";
                            if (result.msg) msg = result.msg;
                            _this.error(input, msg);
                        }
                    },
                    error: function () {
                        _this.error(input, gMsg.userError);
                    }
                });

            },
            password: function (input) {
                var val = $.trim(input.val());
                if (!val) {
                    this.error(input, gMsg.pwdEmpty);
                    return;
                }
                var len  = val.length;
                if (len < 6) {
                    this.error(input, gMsg.pwdTooShort);
                    return;
                }
                if (len > 16) {
                    this.error(input, gMsg.pwdTooLong);
                    return;
                }
                this.passwordSuccess = true;
                this.success();
            },
            error: function (input, msg) {
                var $sp_tip = $(".error");
                $sp_tip.html(msg).show();

            },
            success: function () {
                var $sp_tip = $(".error");
                $sp_tip.html("&nbsp;").hide();
            }
        };
        /*记住密码的情况*/
        setTimeout(function(){
            verify.accountSuccess = $userAccount.val()?true:false;
            verify.passwordSuccess = $userPwd.val()?true:false;
        }, 50);
        $(".formList input[type='password']").bind({
            keydown: function (event) {
                if (event.keyCode == 13) {
                    $(this).triggerHandler("blur");
                    $login_btn.click();
                }
            }
        });
        $login_btn.click(function () {
            setTimeout(function(){
                if (verify.accountSuccess && verify.passwordSuccess) {
                    $login_btn[0].form.submit();
                } else {
                    if (!verify.accountSuccess) {
                        verify.account($userAccount, function(){
                            $login_btn.click();
                        });
                        //  $userAccount.blur();
                        return false;
                    } else if (!verify.passwordSuccess) {
                        $userPwd.blur();
                        if(verify.passwordSuccess){
                            $login_btn.click();
                        }
                    }
                }
            }, 20);
            return false;
        });
    };

    /*注册*/
    passport.register = function (userInfo) {
       $(".ph_input").placeholder();
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
            pwdIll:"密码请勿使用特殊字符",
            emailEmpty: "注册邮箱必填",
            pwdEmpty: "密码必填",
            nameEmpty: "昵称必填",
            dealEmpty: "请先同意用户协议",
            phoneErr:"请输入正确的手机号码"
        };

        var $nickName = $("#nickName"),
            $nickNamePhone = $("#nickNamePhone"),
            $userAccount = $("#userAccount"),
            $userAccountPhone = $("#userAccountPhone"),
            $userPwd = $("#userPwd"),
            $userPwdPhone = $("#userPwdPhone"),
            $sendCodePhone = $("#send_code"),
            $agreeDeal = $("#agreeDeal"),
            $agreeDealPhone = $("#agreeDealPhone"),
            $infoErr = $("#infoErr"),
            $infoErrPhone = $("#infoErrPhone"),
            $login_btn = $("#login_btn"),
            $login_btn_phone = $("#login_btn_phone"),
            $reg_email_tab = $("#reg_email_tab"),
            $reg_phone_tab = $("#reg_phone_tab"),
            $register = $(".register"),
            $resend_code_btn = $("#resend_code_btn"),
            $email_code = $("#checkCode");


        $("#changeCity").click(function(){
            requirejs(["module/dialogs/city"], function(city){
                if(!city) return;
                city.open(function(pro, ct){
                    $("#city_info").html(pro+ct);
                    $(".register_province").val(pro);
                    $(".register_city").val(ct);
                });
            });
        });

        $("#deal_info, #deal_info_phone").click(function(){
            copyright.applyDeal();
        });

        $reg_email_tab.click(function(){
            verify.init();
            $register.removeClass("phone").addClass("email");
        });
        $reg_phone_tab.click(function(){
            verify.init();
            $register.removeClass("email").addClass("phone");
        });
        $nickName.blur(function () {
            verify.name($(this));
        });
        $nickNamePhone.blur(function () {
            verify.name($(this));
        });
        $userAccount.blur(function () {
            if($(this).attr("cancel_blur")){
                return;
            }
            verify.account($(this));
        });
        $userAccountPhone.blur(function () {
            verify.phone($(this));
        });
        $userPwd.blur(function () {
            verify.password($(this));
        });
        $userPwdPhone.blur(function () {
            verify.password($(this));
        });
        $email_code.blur(function(){
            verify.codeEmail($(this));
        });
        $sendCodePhone.blur(function(){
            verify.code($(this));
        });
        $agreeDeal.click(function () {
            verify.deal();
        });
        var verify = {
            nameSuccess: false,
            accountSuccess: false,
            passwordSuccess: false,
            phoneSuccess:false,
            codeEmailSuccess:false, //页面验证码
            codeSuccess:false, //手机验证码
            init:function(){
                this.nameSuccess = false;
                this.accountSuccess = false;
                this.passwordSuccess = false;
                this.phoneSuccess = false;
                this.codeSuccess = false;
            },
            name: function (input) {
                this.nameSuccess = false;
                var val = $.trim(input.val());
                if (!val) {
                    this.error(input, gMsg.nameEmpty);
                    return;
                }
                //判定非法字符串
                var res = passport.validator(val, "illchar");
                if (res) {
                    this.error(input, gMsg.nameIll);
                    return;
                }
                //汉字转字母 求长度
                var val_tmp = val;
                val_tmp = val_tmp.replace(regexEnum["include_chinese"], "aa");
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
                    data: { nickname: val },
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
                var val = $.trim(input.val());
                if (!val) {
                    this.error(input, gMsg.emailEmpty);
                    return;
                }
                if (!passport.validator(val, "email")) {
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
                    data: { email: val },
                    success: function (result) {
                        if (result.success) {
                            _this.accountSuccess = true;
                            _this.success(input);
                        } else {
                            _this.error(input, result.msg);
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        serverError(jqXHR, textStatus, errorThrown);
                    }
                });
                // this.accountSuccess = true;
                // this.success(input);
            },
            phone:function(input){
                this.phoneSuccess = false;
                var val = $.trim(input.val());
                if(!passport.validator(val, "mobile")){
                    this.error(input, gMsg.phoneErr);
                    return;
                }

                this.phoneSuccess = true;
                this.success(input);
            },
            password: function (input) {
                this.passwordSuccess = false;
                var val = $.trim(input.val());
                if(passport.validator(val, "include_chinese")){
                    this.error(input, gMsg.pwdIll);
                    return;
                }
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
                this.passwordSuccess = true;
                this.success(input);
            },
            error: function (input, msg) {

                var $sp_tip = input.parents(".formItem").children(".sp_tip");
                $sp_tip.removeClass("sp_right")
                    .addClass("sp_error")
                    .html(msg);
                input.removeAttr("timer");
            },
            success: function (input) {

                var $sp_tip = input.parents(".formItem").children(".sp_tip");
                $sp_tip.addClass("sp_right")
                    .removeClass("sp_error")
                    .html("");
                if(login_btn_click){
                    login_btn_click = false;
                    $login_btn.click();
                }
                if(login_btn_phone_click){
                    login_btn_phone_click = false;
                    $login_btn_phone.click();
                }
            },
            deal: function () {
                //用户完善信息 没有同意协议选项
                if (userInfo) {
                    return true;
                }
                if ($agreeDeal[0].checked) {
                    $infoErr.html("");
                    return true;
                } else {
                    $infoErr.html(gMsg.dealEmpty);
                    return false;
                }
            },
            dealPhone:function(){
                if ($agreeDealPhone[0].checked) {
                    $infoErrPhone.html("");
                    return true;
                } else {
                    $infoErrPhone.html(gMsg.dealEmpty);
                    return false;
                }
            },
            codeEmail:function(input){
                this.codeEmailSuccess  = false;
                var val = $.trim(input.val());
                if(!val || val.length<4){
                    this.error(input, "请输入正确的验证码");
                    return;
                }
                this.codeEmailSuccess = true;
                this.error(input, "");
            },
            code:function(input){
                this.codeSuccess = false;
                var val = $.trim(input.val());
                if(!val){
                    $infoErrPhone.html("请输入正确的验证码");
                    return;
                }
                this.codeSuccess = true;
                $infoErrPhone.html("");
            }
        };

        $(".formList input[type='password']").bind({
            keydown: function (event) {
                if (event.keyCode == 13) {
                    $(this).triggerHandler("blur");
                    $login_btn.click();
                }
            }
        });
        var login_btn_click = false;
        $login_btn.click(function () {

            login_btn_click = true;
            if (verify.nameSuccess &&
                verify.accountSuccess &&
                verify.passwordSuccess &&
                verify.codeEmailSuccess &&
                verify.deal()) {
                $login_btn[0].form.submit();
            } else {
                verify.nameSuccess || $nickName.blur();
                verify.accountSuccess || $userAccount.blur();
                verify.passwordSuccess || $userPwd.blur();
                verify.codeEmailSuccess ||  $email_code.blur();
            }
            return false;
        });
        var login_btn_phone_click = false;
        $login_btn_phone.click(function () {
            login_btn_phone_click = true;
            if (verify.nameSuccess &&
                verify.phoneSuccess &&
                verify.passwordSuccess &&
                verify.codeSuccess&&
                verify.dealPhone()) {
                $login_btn_phone[0].form.submit();
            } else {
                verify.nameSuccess || $nickNamePhone.blur();
                verify.phoneSuccess || $userAccountPhone.blur();
                verify.passwordSuccess || $userPwdPhone.blur();
                verify.codeSuccess || $sendCodePhone.blur();
                if(verify.codeSuccess){
                    verify.dealPhone();
                }
            }
            return false;
        });
        var time = 60,
            total_time = 60* 3,
            hold_timer = 0;

        $resend_code_btn.click(function(){
            if(!verify.phoneSuccess){
                $userAccountPhone.blur();
                return;
            }
            $resend_code_btn.attr("disabled","disabled");
            var phone_num = $.trim($userAccountPhone.val());
            $.post(re_send_url,{"phone_num": phone_num,msgType:4/*,"serial": 2*/}, function(data){
                if(!data.success){
                    $infoErrPhone.html(data.msg);
                    if(data.time){
                        time = total_time - parseInt(data.time/1000);
                        if(time>0){
                            holdSend(time);
                        }
                    }else{
                        $resend_code_btn.removeAttr("disabled");
                    }
                    return;
                }else{
                    $("#phoneToken").val(data.token);
                    holdSend(total_time);
                }
            },"json");
        });

        function holdSend(time){
            time = time || total_time;

            $resend_code_btn.html("点击重发("+time+")");
            hold_timer = setInterval(function(){
                if(time<=0){
                    $resend_code_btn.html("免费获取验证码");
                    $resend_code_btn.removeAttr("disabled");
                    clearInterval(hold_timer);
                    return;
                }
                time--;
                $resend_code_btn.html("点击重发("+time+")");
            },1000);
        }
    };

    function checkPath(path){
        if(!path) path= config.STATIC_ROOT + "/css/img/common/person_60.jpg";
        if (path.indexOf("http://") < 0) {
            if (window.config) {
                path = (config.FDFS_PATH || "") + "/" + path;
            }
        }
        return path;
    }

    passport.friends = function () {
        var isFirst = true,
            existPage = {},
            curPage = 0,
            totalPage = 999;

        var $paging = $("#paging");
        function getPageData(page) {

            if (page > totalPage || page <= 0) {
                return;
            }

            if (existPage[page]) {
                showPage(page);
                return;
            }


            $.ajax({
                url: friends_paged_url,
                type: "get",
                dataType: "json",
                data: { pageId: page, __t: (new Date()).valueOf() },
                cache: false,
                success: function (result) {
                    if (result.success && result.msg) {
                        if (isFirst) {
                            createInfo(result.msg);
                            isFirst = false;
                        }
                        createPage(result.msg);
                    } else {
                        if (window.console) console.info("获取微博好友失败！！");
                    }
                },
                error: function () {
                    if (window.console) console.info("获取微博好友失败！！ajax错误");
                }
            });
        }
        getPageData(1);


        function showPage(page) {
            curPage = parseInt(page);
            $paging.children(".page.current").removeClass("current");
            $paging.children(".page[page='" + page + "']").addClass("current");
            $(".friend_list_page").hide();
            $(".friend_list_page[page='" + page + "']").show();
        }

        function createInfo(data) {
            var $totalNum = $("#totalNum");
            $totalNum.html(data.totalCount);
            var page_str = "";
            var maxPage = data.maxPageId;
            if (maxPage <= 1) return;
            page_str += '<a class="prevPage" href="javascript:;" style="display:none;">上一页</a>';
            for (var i = 0; i < maxPage; i++) {
                var pg = i + 1;
                page_str += '<a class="page" href="javascript:;" page="' + pg + '">' + pg + '</a>';
            }
            page_str += '<a class="nextPage" href="javascript:;">下一页</a>';
            $paging.html(page_str);

            var $nextPage = $paging.find(".nextPage");
            var $prevPage = $paging.find(".prevPage");
            $nextPage.click(function () {
                checkPage(curPage + 1);
                getPageData(curPage + 1);
            });

            $prevPage.click(function () {
                checkPage(curPage - 1);
                getPageData(curPage - 1);
            });
            $paging.click(function (event) {
                var $page = $(event.target);
                if ($page.hasClass("page")) {
                    var page = $page.text();
                    checkPage(page);
                    getPageData(page);

                }
            });
            function checkPage(page) {
                if (page >= maxPage) {
                    $nextPage.hide();
                } else {
                    $nextPage.show();
                }
                if (page <= 1) {
                    $prevPage.hide();
                } else {
                    $prevPage.show();
                }
            }

        }
        var gChosenUid = {};
        function createPage(data) {
            var page = data.pageId;
            totalPage = data.maxPageId;
            if (page > totalPage) {
                return;
            }
            existPage[page] = true;
            var list = data.list;
            if (!page || !list) {
                return;
            }

            var list_str = '<div class="friend_list_page" page="' + page + '"><div class="attention attention_on toggle_all">' +
                '<span class="tag-default"><u></u></span>' +
                '<span class="tag-select"><u></u></span>' +
                '关注本页' +
                '</div>';
            var ul = '<ul class="ul_list">';
            var endCss = "end";
            for (var i = 0, l = list.length; i < l; i++) {
                var friend = list[i];
                var uid = friend.uid;
                gChosenUid[uid] = true;
                ul += '<li class="' + ((i + 1) % 9 == 0 ? endCss : "") + '" uid="' + uid + '">' +
                    '<div class="fd_head hover on"><img alt="' + friend.nickname + '" src="' + checkPath(friend.middleLogo) + '">';

                ul += '<span class="tag-default"><u></u></span>' +
                    '<span class="tag-select"><u></u></span></div><div class="fd_name">' + friend.nickname +
                    '</div></li>';
            }
            ul += '</ul>';
            list_str += ul + "</div>";
            $(".friendList").append(list_str);
            addPageAct(page);
            showPage(page);
        }

        function addPageAct(page) {
            var $page = $(".friend_list_page[page='" + page + "']"),
                $toggle_all = $page.find(".toggle_all"),
                $fd_head = $page.find(".fd_head");

            $toggle_all.addClass("attention_on").attr("select", true);
            $toggle_all.click(function () {
                var $hd = $page.find(".fd_head");
                var _this = $(this);
                if (_this.attr("select")) {
                    unselectCss($hd);
                    unselectData($hd);
                    _this.removeAttr("select");
                    _this.removeClass("attention_on");
                } else {
                    selectCss($hd);
                    selectData($hd);
                    _this.attr("select", true);
                    _this.addClass("attention_on");
                }
            });
            // $chbox.click(function () {
            $fd_head.click(function () {
                var _this = $(this);
                if (_this.hasClass("on")) {
                    //选中
                    unselectCss(_this);
                    unselectData(_this);
                } else {
                    selectCss(_this);
                    selectData(_this);
                }
            });
        }

        function selectData(chbox) {
            chbox.each(function () {
                var _this = $(this);
                var uid = _this.parents("li[uid]").attr("uid");
                gChosenUid[uid] = true;
            });
        }
        function unselectData(chbox) {
            chbox.each(function () {
                var _this = $(this);
                var uid = _this.parents("li[uid]").attr("uid");
                gChosenUid[uid] = false;
                delete gChosenUid[uid];
            });
        }
        var $skipRecommend = $("#skipRecommend"),
            $nextStep = $("#nextStep");


        function skipPage(url) {
            url = url || skip_url;
            window.location.href = url;
        }

        //跳过推荐
        $skipRecommend.click(function () {
            followMyFriends();

        });
        //下一步
        $nextStep.click(function () {
            var uidStr = getFollowedFriends();
            $("#followed_friends").val(uidStr);
            $(this)[0].form.submit();
            return false;
        });
        function getFollowedFriends() {
            var uidArr = [];
            for (var uid in gChosenUid){
                uidArr.push(uid);
            }
            return uidArr.join(",");
        }
        function followMyFriends() {
            var uidStr = getFollowedFriends();
            //if(window.console) console.log(uidStr);
            $.ajax({
                url: friends_url,
                data: { followUids: uidStr },
                type: "post",
                success: function () {
                    skipPage();
                },
                error: function () {
                    skipPage();
                }
            });
            //window.location.href = "new_found.html";
        }
    };
    passport.userInfo = function () {
        passport.register(true);
    };
    passport.found = function () {

        var allSort = {}; //{sortId:分类}

        var $figure = $(".figure"),
            $startTrip = $("#startTrip"),
            $changeGroup = $("#changeGroup"),
            sortCache = {}, //数据缓存
            selectedSort = {}; //数据记录

        //按钮定位
        var $foundBot = $(".foundBot"),
            $found_cover = $(".found-cover");
        var checkScroll = function(){
            var st = $(document).scrollTop();
            if($foundBot.offset().top <= st+$(window).height()){
                //固定到底部
                $found_cover.removeClass("fixed-cover");
            }else{
                //fixed
                $found_cover.addClass("fixed-cover");
            }
        };
        $(window).bind("scroll", checkScroll);
        checkScroll();
        addSortAction();
        function addSortAction() {
            var $sortItem = $(".sortList").find(".sort_item");

            $sortItem.each(function (idx) {
                var _this = $(this);
                allSort[_this.attr("sortId")] = {
                    index: idx,
                    sortTitle: _this.attr("sortTitle")
                };

            });

            $sortItem.bind({
                mouseenter: function () {
                    var _this = $(this);
                    _this.addClass("hover");
                    ddPng(_this);
                },
                mouseleave: function () {
                    var _this = $(this);
                    /* if (_this.attr("select")) {
                     return;
                     }*/
                    _this.removeClass("hover");
                    ddPng(_this);
                },
                click: function () {
                    var _this = $(this);
                    if (_this.attr("select")) {
                        _this.removeAttr("select");

                        deleteOneSort(_this);
                    } else {
                        _this.attr("select", true);
                        addOneSort(_this);
                    }

                }
            });
            $sortItem.each(function () {
                var _this = $(this);
                if (_this.attr("select")) {
                    addOneSort(_this);
                }
            });
        }

        /*添加一个分类*/

        function addOneSort(tag) {
            deleteOneSort(tag);
            tag.addClass("on");
            ddPng(tag);
            var sortId = tag.attr("sortId");
            getSortData(sortId);
            if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style && DD_belatedPNG) {
                tag.find("span u").each(function(){
                    DD_belatedPNG.fixPng(this);
                });

            }
        }

        function deleteOneSort(tag) {
            /* sortId 分类的id 暂用sortId */
            tag.removeClass("on");
            ddPng($(tag));
            var sortId = tag.attr("sortId");
            selectedSort[sortId] = false;
            delete selectedSort[sortId];
            var sort = getSortById(sortId);
            sort.hide();
            checkScroll();
            checkSortSize();
        }

        function hideSortById() {

        }
        function getSortById(sid) {
            return $figure.children(".figureItem[sortId='" + sid + "']");
        }
        function showOneSort(sortId, page) {
            var $figureItem =  $figure.children(".figureItem[sortId='" + sortId + "'][page='" + page + "']:hidden");
            /*   if($figureItem.length == 0){
             return;
             }
             //选中的分类放到最前面
             $figureItem.prependTo($figure);*/
            $figureItem.show();
            checkSortSize();
        }
        function getSortData(sortId) {
            if (!selectedSort[sortId]) {
                selectedSort[sortId] = {};
                selectedSort[sortId].page = 1;
                selectedSort[sortId].maxPage = 999;
            } else {
                selectedSort[sortId].page = selectedSort[sortId].page + 1;
                if (selectedSort[sortId].page > selectedSort[sortId].maxPage) {
                    selectedSort[sortId].page = 1;
                }
            }
            if (!selectedSort[sortId].uuid) {
                selectedSort[sortId].uuid = {};
            }
            var page = selectedSort[sortId].page;
            if (sortCache[sortId + "_" + page]) {
                selectedSort[sortId].maxPage = sortCache[sortId + "_" + page].maxPageId;
                var sortData = sortCache[sortId + "_" + page];
                for(var i= 0,l=sortData.list.length;i<l;i++){
                    var uuid =  sortData.list[i].uid;
                    //找到隐藏的选中的用户 并记录
                    if($figure.find(".figureItem[sortId='" + sortId + "'][page='" + page + "'] li[uuid="+uuid+"] .hd").hasClass("on")){
                        selectedSort[sortId].uuid[uuid] = true;
                    }
                }
                var sort = getSortById(sortId);
                sort.hide();
                showOneSort(sortId, page);
                checkScroll();
                return;
            }
            $.ajax({
                url: user_url,
                data: { categoryId: sortId, pageId: page },
                dataType: "json",
                success: function (result) {
                    if (!result) return;
                    sortCache[sortId + "_" + page] = result;
                    createSort(result, sortId);
                    checkScroll();
                }

            });
        }
        function checkSortSize(){
            var $figureItem = $figure.children(".figureItem:visible");
            if($figureItem.length>0){
                $changeGroup.parents(".tit").show();
            }else{
                $changeGroup.parents(".tit").hide();
            }
        }
        checkSortSize();
        function createSort(result, sortId) {
            var list = result.list;
            selectedSort[sortId].maxPage = result.maxPageId;
            var num =   allSort[sortId]["index"];
            if(num >=18 ){
                num -= 18;
            }
            var figureItem = '<div class="figureItem" sortId="' + sortId + '" page="' + result.pageId + '">' +
                '<div class="sortName c' + num + '"><h3>' + allSort[sortId].sortTitle + '</h3></div><div class="sortWarp"><ul>';
            for (var i = 0; i < list.length; i++) {
                var person = list[i];
                var sId = person.categoryId;
                selectedSort[sId].uuid[person.uid] = true;
                //默认补选中了
                figureItem += '<li  uuid="' + person.uid + '">' +
                    '<div class="hd hover on" card="'+person.uid+'" card_type="passport">' +
                    '<img alt="" src="' + checkPath(person.avatarPathLarge) + '">' +
                    '<span class="tag-default"><u></u></span>' +
                    '<span class="tag-select"><u></u></span>' +
                    '</div>' +
                    '<div class="bd">' + person.nickname + ' </div></li>';
            }
            figureItem += '</li></ul></div></div>';
            var sort = getSortById(sortId);
            sort.hide();
            var $figureItem = $(figureItem);
            if (sort.length == 0) {
                if($figure.children().length == 0){
                    $figure.append($figureItem);
                }else{
                    $figureItem.insertBefore($figure.children().eq(0));
                }
            } else {
                sort.last().after($figureItem);
            }
            ddPng($figureItem);
            checkSortSize();
        }
        //选中事件
        function addSelectAct() {
            var $toggle_all = $("#choose_all");
            $toggle_all.addClass("attention_on").attr("select", true);
            $toggle_all.click(function () {
                var $hd = $figure.find(".figureItem:visible .hd");
                var _this = $(this);
                if (_this.attr("select")) {
                    unselectCss($hd);
                    unselectData($hd);
                    _this.removeAttr("select");
                    _this.removeClass("attention_on");
                } else {
                    selectCss($hd);
                    selectData($hd);
                    _this.attr("select", true);
                    _this.addClass("attention_on");
                }
            });
            //var $hd = $figure.find(".hd");
            $figure.on("click", ".hd", function () {
                var _this = $(this);
                if (_this.hasClass("on")) {
                    //取消选中
                    unselectCss(_this);
                    unselectData(_this);

                } else {
                    selectCss(_this);
                    selectData(_this);
                }
            });
        }
        addSelectAct();

        function selectData($hd, unselect) {
            $hd.each(function () {
                var _this = $(this);
                var sortId = _this.parents(".figureItem").attr("sortId");
                var uuid = _this.parents("li[uuid]").attr("uuid");
                if (!uuid) {
                    return;
                }
                var s_uuid = selectedSort[sortId].uuid;
                // console.log(s_uuid, uuid)
                if (!unselect) {
                    s_uuid[uuid] = true;
                } else {
                    s_uuid[uuid] = false;
                    //delete selectedSort[sortId].uuid[uuid];
                    //selectedSort[sortId].uuid[uuid] = false;
                }
            });

        }
        function unselectData($hd) {
            selectData($hd, true);
        }
        //根据已选中分类，获取新数据
        $changeGroup.click(function () {
            for (var sortId in selectedSort) {
                getSortData(sortId);

            }
        });

        //开始喜马拉雅之旅
        $startTrip.click(function () {
            var sort_id=[],
                uuid_arr = [];
            var post_data = "{";
            for (var sid in selectedSort) {
                var sort_uuid = selectedSort[sid]["uuid"];
                sort_id.push(sid);
                var single_sort_uuid = [];
                for (var uuid in sort_uuid) {
                    if (sort_uuid[uuid]) {
                        uuid_arr.push(uuid);
                        single_sort_uuid.push(uuid);
                    }
                }
                if(post_data != "{"){
                    post_data += ",";
                }
                post_data += '"'+sid +'"' + ':"' +  single_sort_uuid.join(',') + '"';
            }

            //选择分类
            if(sort_id.length == 0){
                if($("#error_tip").length > 0){
                    clearTimeout($("#error_tip").attr("timer"));
                    $("#error_tip").remove();
                }
                var temp = $('<div id="error_tip" style="color:red;position:relative;z-index: 2;">请至少选择一个分类哟</div>');
                $startTrip.parent().append(temp);
                var timer = setTimeout(function(){
                    $("#error_tip").fadeOut(300, function(){
                        $(this).remove();
                    });
                },2000);
                temp.attr("timer", timer);
                return false;
            }
            var uuids_str =  uuid_arr.join(",");
            var extra_id = getFollowsId();
            //添加额外的 关注人的id
            if(extra_id){
                if(uuids_str.indexOf(extra_id) == -1){
                    if(uuids_str){
                        uuids_str += ",";
                    }
                    uuids_str += extra_id;
                }
                if(post_data.indexOf(extra_id == -1)){
                    post_data += ', "-1":"'+ extra_id+'"';
                }
            }
            post_data += "}";
            $("#followed_user").val(uuids_str); //修改为post_data   {sort_id:uuids_str}
            $("#followed_user").val(post_data);
            $("#followCategoryIds").val(sort_id.join(","));
            if (window.console) console.info(uuids_str);

            var like_sound_id = getLikeSoundId();
            var _this = this;
            if(like_sound_id){
                sound.like(like_sound_id, true, function(){
                    $(_this)[0].form.submit();
                });
            }else{
                $(_this)[0].form.submit();
            }
            return false;
        });
    };

    function getFollowsId(){
        var id = helper.cookie.getCookie("j_follow_id");
        helper.cookie.delCookie("j_follow_id");
        return id;
    }

    function getLikeSoundId(){
        var id = helper.cookie.getCookie("j_like_sound_id");
        helper.cookie.delCookie("j_like_sound_id");
        return id;
    }
    function selectCss(tag) {
        $(tag).addClass("on");
        ddPng($(tag));
    }

    function unselectCss(tag) {
        $(tag).removeClass("on");
        ddPng($(tag));
    }

    function ddPng(tag){
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style && DD_belatedPNG) {
            tag.find("span u").each(function(){
                var $this = $(this);
                if(!$this.attr("ddpng")){
                    DD_belatedPNG.fixPng(this);
                    $(this).attr("ddpng", true);
                }
            });
        }
    }


    function serverError(jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 401) {
            //  window.location.href = error_url;
        }
    }
    return passport;
});
