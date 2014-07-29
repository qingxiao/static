/// <summary>
/// 头部菜单事件
/// </summary>
define([
    "jquery",
    "plugin/dialog",
    "module/header/message",
    "helper",
    "model/account"],
    function ($, dialog, message, helper, AccountModel) {
        var $menu = $(".menu");
        var $menuItmeDiscover = $menu.find(".menu_explore");
        var $getNewMsgBtn = $(".getNewMsgBtn");
        var $msgMenu = $(".loginPanel_MenuPop");
        var timeID = 0, timeID1 =10;

        //头部-搜索菜单下拉显示功能
        $menuItmeDiscover.find("span").off().on("click", function () {
            if ($menuItmeDiscover.hasClass("is-open")) {
                $menuItmeDiscover.removeClass("is-open");
            } else {
                $menuItmeDiscover.addClass("is-open");
            }
            $(".discoverMenu").stop().slideToggle("normal");

            return false;
        });
        //消息提醒
        $getNewMsgBtn.on({
            mouseenter: function () {
                if (!message.locked) {
                    message.locked = true;
                    $msgMenu.height(0).css("opacity", "hide").animate({
                        height: 124,
                        opacity: 'show'
                    }, 200);
                    $(".loginPanel_MsgPop").hide();
                }
                clearTimeout(timeID);
            },
            mouseleave: function () {
                clearTimeout(timeID);
                timeID = setTimeout(function () {
                    $msgMenu.stop().slideUp(100, "swing", function () {
                        message.locked = false;
                        message.seqMessage();
                    });
                }, 200);
            }
        });
        $msgMenu.on({
            mouseover: function () {
                clearTimeout(timeID);
            },
            mouseleave: function () {
                $getNewMsgBtn.trigger("mouseleave");
            }
        });
        message.start();

        //登录后 头像
        var $loginPanel = $(".loginPanel"),
            $loginPanel_accountPop = $loginPanel.find(".loginPanel_accountPop");
        $loginPanel.find(".userfaceBtn").on({
            mouseenter: function () {
                if (timeID1) {
                    $loginPanel_accountPop.css("opacity", "hide").height(0).animate({
                        height: 79,
                        opacity: 'toggle'
                    }, 100);
                }
                clearTimeout(timeID1);
                $(".loginPanel_MsgPop").hide();
                timeID1 = 0;
            },
            mouseleave: function () {
                clearTimeout(timeID1);
                timeID1 = setTimeout(function () {
                    $loginPanel_accountPop.stop().slideUp(100);
                    message.locked = false;
                    message.seqMessage();
                }, 200);
            }
        });
        $loginPanel_accountPop.on({
            mouseover: function () {
                clearTimeout(timeID1);
                timeID1 = 0;
            },
            mouseleave: function () {
                $loginPanel.trigger("mouseleave");
            }
        });
        //登陆前 登录框
        var $loginBtn = $loginPanel.find(".loginBtn"),
            $loginPanel_loginPop = $loginPanel.find(".loginPanel_loginPop"),
            $password = $loginPanel_loginPop.find(".password"),
            $loginPanel_thirdLoginPop = $loginPanel.find(".loginPanel_thirdLoginPop"),
            $doc = $(document);
        var offFn = function (e) {
            var $target = $(e.target);
            if ($target.closest(".loginPanel_loginPop").size() > 0 || $target.closest(".loginPanel_thirdLoginPop").size() > 0) {
                return;
            }
            $loginPanel_loginPop.hide();
            $loginPanel_thirdLoginPop.hide();
            $doc.off("mousedown", offFn);
        };
        $loginBtn.on("click", function () {
            $loginPanel_loginPop.show();
            $doc.on("mousedown", offFn);
        });
        // 帐号  第三方登录框 切换
        $loginPanel_loginPop.on("click", ".thirdlogin_click, .qqSmallLoginBtn, .weiboSmallLoginBtn", function () {
            $loginPanel_loginPop.hide();
            $loginPanel_thirdLoginPop.show();
            return false;
        });
        $loginPanel_thirdLoginPop.on("click", ".login_click", function () {
            $loginPanel_loginPop.show();
            $loginPanel_thirdLoginPop.hide();
            return false;
        });

        //登录操作
        var accountModel = new AccountModel();
        $loginPanel_loginPop.on("click", ".submitBtn", function () {
            var $account = $loginPanel_loginPop.find(".username"),
                $rememberMe = $loginPanel_loginPop.find(".rememberMe"),
                account = $.trim($account.val()),
                pwd = $.trim($password.val()),
                rememberMe = !!$rememberMe[0].checked;

            if(!account || !pwd){
                dialog.alert("帐号或密码不能为空");
                return;
            }
            accountModel.login(account, pwd, rememberMe, function (reslut) {
                window.location.reload();
            }, function (reslut) {
                dialog.alert(reslut.errorMsg || "帐号或密码错误");
            });
        });
        $password.on("keydown", function(e){
            if(e.keyCode == 13){
                $loginPanel_loginPop.find(".submitBtn").trigger("click");
            }
        });
        $loginPanel_thirdLoginPop.on("click", "a", function () {
            var $a = $(this),
                type = 0;
            if ($a.hasClass("weiboLoginBtn")) {
                type = 1;
            }
            if ($a.hasClass("qqLoginBtn")) {
                type = 2;
            }
            if (type == 0) {
                return;
            }
            helper.login(type, "");
            return false;
        });

    });
