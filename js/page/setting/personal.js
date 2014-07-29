/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午5:14
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'helper',
    'page/page_base',
    'model/setting',
    'module/dialogs/city',
    'plugin/dialog',
    'module/dialogs/bindemail',
    'module/dialogs/bindmobile'],
    function ($, helper, PageBase, SettingModel, city, dialog, bindemailDialog, bindmobile) {
        var Page = PageBase.extend({
            model: new SettingModel(),
            init: function () {
                this.callParent("init");
                this.initConstellation();
                this.initBirthday();
                this.bindEvents();
                this._error = {
                    nickname: false,
                    realname: false,
                    signature: false
                };
            },
            bindEvents: function () {
                var _this = this;
                //城市选择
                var $changeCity = $("#changeCity"),
                    $province = $("#province"),
                    $city = $("#city");
                $changeCity.on("click", function () {
                    city.open(function (pro, city) {
                        $changeCity.html(pro + " • " + city);
                        $province.val(pro);
                        $city.val(city);
                    });
                });

                //重发验证邮件
                var $resendMail = $("#resendMail");
                $resendMail.on("click", function () {
                    _this.resendMail();
                });
                var $resendMail2 = $("#resendMail2");
                $resendMail2.on("click", function () {
                    _this.resendMail();
                });
                //绑定手机
                var $phone_bind = $("#phone_bind"),
                     $phone_bind2 = $("#phone_bind2");
                $phone_bind.on("click", function(){
                    _this.bindMobile();
                });
                $phone_bind2.on("click", function(){
                    _this.bindMobile();
                });
                //绑定邮箱
                var $emailBind = $("#email_bind"),
                    $emailShow = $("#email_show"),
                    $emailActivate = $("#email_activate"),
                    $emailActivate2 = $("#email_activate2");
                $emailBind.on("click", function () {
                    bindemailDialog.open(function (response) {
                        var email = response.email;
                        $emailShow.html(email);
                        $emailBind.hide();
                        $emailActivate.attr("href", response.domain);
                        $emailActivate2.attr("href", response.domain);
                    });
                });
                //修改昵称
                var $nickname_show = $("#nickname_show"),
                    $nickname = $("#nickname");
                $("#changeNickname").on("click", function () {
                    $nickname_show.hide();
                    $nickname.val($nickname_show.html()).show();
                    $(this).hide();
                });
                $nickname.on({
                    blur: function () {
                        _this.checkNickname($nickname);
                    },
                    focus: function () {
                        _this.infoClear($nickname);
                    }
                });
                //个人简介
                var $personalSignature = $("#personalSignature");
                $personalSignature.on({
                    blur: function () {
                        _this.checkSignature($personalSignature);
                    },
                    focus: function () {
                        _this.infoClear($personalSignature);
                    }
                });
                //真实姓名
                var $realName = $("#realName");
                $realName.on({
                    blur: function () {
                        _this.checkRealName($realName);
                    },
                    focus: function () {
                        _this.infoClear($realName);
                    }
                });
                //提交
                $("#confirmBtn").on("click", function () {
                    for (var nn in _this._error) {
                        if (_this._error[nn]) {
                            return;
                        }
                    }
                    _this.submit();
                });

            },
            bindMobile:function(){
                bindmobile.open(function(){
                    $(".verify_mobile").show();
                    $(".unverify_mobile").hide();
                });
            },
            checkRealName: function ($input) {
                var val = $.trim($input.val()),
                    len = helper.gblen(val),
                    msg = "",
                    _this = this;
                this._error.realname = false;
                if (!val) {
                    return true;
                }
                if (len > 20 || len <= 2) {
                    msg = "请填写真实姓名";
                    _this.infoError($input, msg);
                    _this._error.realname = true;
                    return false;
                }
                return true;
            },
            checkSignature: function ($input) {
                //300个字
                this._error.signature = false;
                var val = $.trim($input.val()),
                    len = helper.gblen(val),
                    msg = "",
                    maxLen = 300,
                    _this = this;
                if (len > maxLen*2) {
                    msg = "请不要超过"+maxLen+"个字";
                    _this.infoError($input, msg);
                    _this._error.signature = true;
                    return false;
                }
                return true;
            },
            checkNickname: function ($nickname, success) {
                //2-10个汉字
                this._error.nickname = false;
                success = success || $.noop;
                var name = $.trim($nickname.val()),
                    len = helper.gblen(name),
                    msg = "",
                    _this = this;
                if (len < 4 || len > 20) {
                    msg = "长度有误，请输入4-20位字符";
                    _this.infoError($nickname, msg);
                    _this._error.nickname = true;
                    return false;
                }
                this.model.checkNickname(name, function (response) {
                    _this.infoCorrect($nickname);
                    success(response);
                }, function (response) {
                    _this.infoError($nickname, response.msg || "服务器繁忙,请稍后再试!");
                    _this._error.nickname = true;
                });
            },
            resendMail: function () {

                var _this = this,
                    $resendMail = $("#resendMail"),
                    $resendMail2 = $("#resendMail2"),
                    resendTimer = 0,
                    holdTime = 60;
                if ($resendMail.hasClass("already")) {
                    return;
                }
                this.model.reSendActive(function (result) {
                    if (result.success) {
                        dialog.success(result.msg);
                        resendTimer = setInterval(function () {
                            holdTime--;
                            if (holdTime <= 0) {
                                clearInterval(resendTimer);
                                $resendMail.removeClass("already").html("重发验证邮件");
                                $resendMail2.removeClass("already").html("重新发送");
                                return;
                            }
                            $resendMail.html('邮件已发送(' + holdTime + ')');
                            $resendMail2.html('已发送(' + holdTime + ')');
                        }, 1000);
                        $resendMail.addClass("already").html('邮件已发送(60)');
                        $resendMail2.addClass("already").html('已发送(60)');
                    } else {
                        dialog.alert(result.msg);
                    }
                }, function () {
                    dialog.warn("服务器繁忙,请稍后再试!");
                });
            },
            submit: function () {
                this.model.set("postData", $("form").serialize());
                this.model.personal(function (data) {
                    dialog.success("保存成功");
                }, function (data) {
                    dialog.alert(data.msg);
                });
            },
            getConstellation:function(){
                return {
                    "白羊":[321,420],
                    "金牛":[421,521],
                    "双子":[522,621],
                    "巨蟹":[622,722],
                    "狮子":[723,823],
                    "处女":[824,923],
                    "天秤":[924,1023],
                    "天蝎":[1024,1122],
                    "射手":[1123,1221],
                    "魔羯":[1222,120],
                    "水瓶":[121,219],
                    "双鱼":[220,320]
                };
            },
            //星座
            initConstellation: function (){
                /*白羊3.21-4.20
                金牛4.21-5.21
                双子5.22-6.21
                巨蟹6.22-7.22
                狮子7.23-8.23
                处女8.24-9.23
                天秤9.24-10.23
                天蝎10.24-11.22
                射手11.23-12.21
                魔羯12.22-1.20 水瓶1.21-2.19 双鱼2.20-320*/

                var $const = $("#constellation"),
                    s_const = $const.val();
                var all = this.getConstellation();
                var options = '<option value="-1">----</option>';
                for(var nn in all){
                    options += '<option value="' + nn+ '">' + nn + '</option>';
                }
                $const.html(options);
                $const.val(s_const);
            },
            setConstellation:function(month, day){
                month = month*1;
                day = day*1;
                var $const = $("#constellation");
                if(month<=0 || day<=0){
                    $const.val(-1);
                    return;
                }
                var all = this.getConstellation();
                var cur = month*100+day,
                    temp = "";

                for(var nn in all){
                    var arr = all[nn];

                    if(cur>=arr[0] && cur<=arr[1]){
                        temp = nn;
                        break;
                    }
                    // 12.22 1.20
                    if((arr[0]>arr[1]) && (cur>=arr[0] || cur<=arr[1])) {
                        temp = nn;
                        break;
                    }
                }

                $const.val(temp);
            },
            initBirthday: function () {
                var $year = $("#birth_year"),
                    $month = $("#birth_month"),
                    $day = $("#birth_day"),
                    s_year = $year.val(),
                    s_month = $month.val(),
                    s_day = $day.val(),
                    cur_date = new Date(),
                    year = cur_date.getFullYear(),
                    i = 0,
                    html_str = "",
                    _this = this;

                html_str = '<option value="-1">----</option>';
                for (i = 0; i < 100; i++) {
                    var y = year - i;
                    html_str += '<option value="' + y + '">' + y + '</option>';
                }
                $year.html(html_str);
                $year.val(s_year);

                html_str = '<option value="-1">--</option>';
                for (i = 1; i < 13; i++) {
                    html_str += '<option value="' + i + '">' + (i < 10 ? "0" + i : i) + '</option>';
                }
                $month.html(html_str);
                $month.val(s_month);

                $month.on({
                    change: function () {
                        var mm = $(this).val(),
                            yy = $year.val();

                        var maxDate = 31;
                        switch (parseInt(mm)) {
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                maxDate = 30;
                                break;
                            case 2:
                                maxDate = (yy % 400 == 0 || (yy % 4 == 0 && yy % 100 != 0)) ? 29 : 28;
                                break;
                        }
                        html_str = '<option value="-1">--</option>';
                        for (var i = 1; i <= maxDate; i++) {
                            html_str += '<option value="' + i + '">' + (i < 10 ? "0" + i : i) + '</option>';
                        }
                        var tpl_value = $day.val();
                        $day.html(html_str);
                        if (tpl_value > maxDate) {
                            tpl_value = maxDate;
                        }
                        $day.val(tpl_value);
                        _this.setConstellation($month.val(), $day.val());
                    }
                });
                $day.on("change", function(){
                     _this.setConstellation($month.val(), $day.val());
                });
                $month.change();
            },
            infoCorrect: function ($input) {
                var $set_dl = $input.closest(".set_dl"),
                    $error = $set_dl.find(".correct");
                $set_dl.addClass("is-correct").removeClass("is-error");
            },
            infoError: function ($input, msg) {
                var $set_dl = $input.closest(".set_dl"),
                    $error = $set_dl.find(".error");
                $set_dl.removeClass("is-correct").addClass("is-error");
                $error.html(msg || "");

            },
            infoClear: function ($input) {
                var $set_dl = $input.closest(".set_dl");
                $set_dl.removeClass("is-correct").removeClass("is-error");
            },
            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });