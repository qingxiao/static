/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'helper',
'../../router'],
function ($, _, Backbone, helper, router) {
    var UnLogin = Backbone.View.extend({
        init: function () {
            var _this = this, $welcomeBg = $(".welcome_bg"), $welcomeBd = $welcomeBg.find(".welcome_bd");
            var $body = $(document.body);
            var $floatHead = $(".floatHeader");
            var $discoverMenu = $(".discoverMenu");
            var $bgImg = $("#bgimg");
            var $loginPanel = $(".loginPanelWelBox");

            helper.scrollTop();
            $(".menu_index").hide();
            $floatHead.css({
                "position": "absolute",
                "bottom": 0
            }).show();
            //$floatHead.parent().remove();
            $floatHead.appendTo($welcomeBg);
            $(".menu_explore").addClass("on is-open");
            $(".discover").on("click", function (e) {
                $welcomeBg.stop().animate({
                    height: 242
                }, 500, function () {
                    $welcomeBg.css({
                        "z-index": "-1",
                        "position": "absolute"
                    });
                    $(".header_wrapper .menu").fadeIn("normal");
                    $discoverMenu.hide().slideDown(300, "swing", function () {
                        $floatHead.removeAttr("style").hide();
                        $floatHead.insertAfter($discoverMenu).show();
                        $welcomeBd.hide();
                        $("#mainbox").show();
                        $welcomeBg.height(0);
                        $loginPanel.hide();
                        $(".footer").show();
                        $body.toggleClass("welcome");
                        router.toPage("go2explore","GET");
                    });
                    _this.model.set("canHide", true);
                });
                $welcomeBd.stop().animate({
                    top: 100
                }, 500);
                $.cookie('welcome', true);

                return false;
            });
            $(".logo").on("click", function () {
                if (_this.model.get("canHide")) {
                    var pos = $discoverMenu.position();
                    var heigh = $floatHead.height() - 4;

                    if (!$discoverMenu.is(":hidden")) {
                        heigh += $discoverMenu.height();
                    } else {
                        heigh += 6;
                    }
                    $("#mainbox").empty().hide();
                    $(".footer").hide();
                    $floatHead.css({
                        "position": "absolute",
                        "bottom": 0
                    }).show();
                    $welcomeBg.height(pos.top + heigh);
                    $floatHead.appendTo($welcomeBg);
                    $body.toggleClass("welcome");
                    $discoverMenu.slideUp(200, "swing", function () {
                        $(".header_wrapper .menu").fadeOut();
                        setTimeout(function () {
                            $welcomeBd.show();
                            $loginPanel.show();
                            $welcomeBg.stop().animate({
                                height: "100%"
                            }, 500, function () {
                                $welcomeBg.css({
                                    "z-index": 10
                                });
                            });
                            $welcomeBd.stop().animate({
                                top: "9%"
                            }, 0);
                        }, 200);
                    });
                    _this.model.set("canHide", false);
                    $.cookie('welcome', null);
                }

                return false;
            });
            $bgImg.on("load", function () {
                $welcomeBg.removeClass("hidden");
                $(".welcomeLoading").fadeOut(300, "swing", function () {
                    $(this).remove();
                });
            }).on("error", function () {
                location.href = location.href;
            }).attr("src", $bgImg.attr("originsrc"));
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            $(".logo").off("click");
            $(".discover").off("click");
        }
    });

    return new UnLogin({
        model: new Backbone.Model({
            canHide: false
        })
    });
});