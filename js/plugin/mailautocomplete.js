define([], function () {
    (function ($) {
        var count = 0;
        $.fn.MailAutoComplete_autoRelease = function () {
            if ($("#mainautocomplete_panel").length > 0) {
                $("#mainautocomplete_panel").remove();
            }
        };
        $.fn.MailAutoComplete = function (option) {
            var defaults = {
                width: 150,
                height: 300,
                onInitialize: function () { },
                onComplete: function () { }
            };
            $(this).each(function (index) {
                count++;
                var that = $(this);
                var offset = $(that).offset();
                var options = $.extend(defaults, option);

                var func = {
                    panel: $("<div id='mainautocomplete_panel' style='position:absolute;z-index:100000;margin:0;background:white;padding:5px;overflow:hidden;border:1px solid #e3e3e3;'></div>"),
                    mailstr: "",
                    lastindex: 0,
                    nowCount: 0,
                    mailArr: [
                    "",
                    "163.com",
			        "126.com",
			        "qq.com",
			        "sina.com",
			        "vip.sina.com",
			        "hotmail.com",
			        "gmail.com",
			        "sina.cn",
			        "sohu.com",
			        "yahoo.cn",
			        "139.com",
			        "wo.com.cn",
			        "189.cn"
                ],
                    init: function () {
                        func.getPosition();
                        index += count;
                        if ($("#mainautocomplete_panel").length > 0) {
                            func.panel = $("#mainautocomplete_panel");
                        }
                        else {
                            $(document.body).append($(func.panel));
                        }
                        $("a.autodata" + index).live("click", function () {
                            $(that).val($(this).text());
                            $(func.panel).hide().attr("hidden", true);
                            func.lastindex = 0;
                            $(that).trigger("focus");
                            options.onComplete({
                                complete: true
                            });
                            return false;
                        }).live("mouseenter", function () {
                            func.panel.find("a.autodata" + index + ":eq(" + func.lastindex + ")").removeClass("mailhover");
                            func.lastindex = $(this).attr("idx") * 1;
                            func.panel.find("a.autodata" + index + ":eq(" + func.lastindex + ")").addClass("mailhover");

                            return false;
                        });
                    },
                    getPosition: function () {
                        var h = $(that).outerHeight();
                        offset = $(that).offset();
                        func.panel.css({
                            left: offset.left,
                            top: offset.top + h,
                            width: $(that).outerWidth() - 5,
                            height: options.height
                        }).hide();
                    },
                    showAutoComplete: function () {
                        var filter = $(that).val();

                        func.getData(filter);
                        $(func.panel).show().removeAttr("hidden");
                    },
                    getData: function (filter) {
                        var sHtml = "";
                        var arr = [];
                        var at = filter.lastIndexOf('@');
                        var mail = filter.substr(at + 1);
                        var select = "";
                        var texta = "";
                        var dl, a;

                        $(func.panel).empty();
                        filter = filter || "";
                        if (func.mailArr.length > 0) {
                            func.mailArr[0] = filter;
                            //sHtml += "<p class='tit'>请选择邮箱类型</p></p>";
                            $(func.panel).append("<p class='tit'>请选择邮箱类型</p></p>");
                            func.nowcount = 0;
                            for (var i = 0; i < func.mailArr.length; i++) {
                                select = "";
                                if (mail != "" && at >= 0 && i > 0) {
                                    if (func.mailArr[i].substring(0, mail.length) != mail.replace(/\s/g, "")) {
                                        continue;
                                    }
                                    texta = filter.substr(0, at) + (i == 0 ? "" : ("@" + func.mailArr[i]));
                                    if (texta == func.mailArr[0]) {
                                        continue;
                                    }
                                    filter = filter.substr(0, at);
                                }
                                filter = filter.replace(/\s/g, "");
                                if (filter.substr(filter.length - 1) == '@') {
                                    filter = filter.substr(0, filter.length - 1);
                                }
                                texta = i == 0 ? func.mailArr[i] : (filter + "@" + func.mailArr[i]);
                                //texta = texta.replace(/(\<|\>)/g, "\<");
                                dl = $("<dl class='clearfix_after' style='height:20px;margin:0;padding:0;white-space: nowrap;word-break:break-all;'></dl>");
                                a = $("<a idx='" + func.nowcount + "' class='autodata" + index + " " + select + "' href='javascript:;'><span style='display:block;height:25px;line-height:25px;' ></span></a>");
                                a.find("span").text(texta).attr("title", texta);
                                dl.append(a);
                                $(func.panel).append(dl);
                                //sHtml += "<dl class='clearfix_after' style='height:20px;margin:0;padding:0;'>";
                                //sHtml += "<a idx='" + func.nowcount + "' class='autodata" + index + " " + select + "' href='javascript:;'><span style='display:block;height:25px;line-height:25px;' >" + texta + "</span></a>";
                                //sHtml += "</dl>";
                                func.nowcount++;
                            }
                        }
                        if (func.lastindex >= func.nowcount) {
                            func.lastindex = 0;
                        }
                        //sHtml += "</div></div>";
                        //$(func.panel).html(sHtml);
                        func.panel.find("a.autodata" + index + ":eq(" + func.lastindex + ")").addClass("mailhover");
                    }
                };
                $(that).bind("keypress", function (e) {
                    switch (e.keyCode) {
                        case 13:
                            func.showAutoComplete();
                            setTimeout(function () {
                                func.panel.find("a.autodata" + index + ":eq(" + func.lastindex + ")").trigger("click");
                            }, 200);
                            break;
                    }
                    
                    //return false;
                }).bind("keyup", function (e) {
                    func.getPosition();
                    switch (e.keyCode) {
                        case 13:
                            break;
                        case 38:
                            if (func.lastindex == 0) {
                                func.lastindex = func.nowcount - 1;
                            }
                            else {
                                func.lastindex--;
                            }
                            func.showAutoComplete();
                            break;
                        case 40:
                            if (func.lastindex == func.nowcount - 1) {
                                func.lastindex = 0;
                            }
                            else {
                                func.lastindex++;
                            }
                            func.showAutoComplete();
                            break;
                        default:
                            options.onInitialize();
                            func.showAutoComplete();
                            break;
                    }
                    //return false;
                }).bind("blur", function () {
                    setTimeout(function () {
                        if ($(func.panel).attr("hidden")) {
                            return;
                        }
                        $(func.panel).hide().attr("hidden", true);
                        options.onComplete({
                            complete: false
                        });
                    }, 200);
                });
                func.init();
            });
        };
    })(jQuery);
});