define(["jquery", "plugin/jquery.parser"], function ($) {
    (function ($) {
        var mails = ["", "163.com", "126.com", "qq.com", "sina.com", "vip.sina.com", "hotmail.com", "gmail.com", "sina.cn", "sohu.com", "yahoo.cn", "139.com", "wo.com.cn", "189.cn"];
        var mailCompletePanel = "<div id='mainautocomplete_panel' style='position:absolute;z-index:100000;margin:0;background:white;padding:5px;overflow:hidden;border:1px solid #e3e3e3;'></div>";
        var $panel = null;
        var timeID = 0;
        var timeID1 = 0;
        var panelStatus = false;

        /// <summary>
        /// 获得位置
        /// </summary>
        /// <param name="jq">元素</param>
        function getPosition(jq) {
            var $jq = $(jq);
            var h = $jq.outerHeight();
            var options = $jq.mailcomplete("options");

            offset = $jq.offset();
            $panel.css({
                left: offset.left,
                top: offset.top + h,
                width: $jq.outerWidth() - 5,
                height: options.height
            });
        };
        /// <summary>
        /// 填充邮箱数据
        /// </summary>
        /// <param name="jq">元素</param>
        /// <param name="index">索引</param>
        function showAutoComplete(jq, index) {
            clearTimeout(timeID1);
            timeID1 = setTimeout(function () {
                var filter = $(jq).val();

                index = index || 0;
                getData(jq, filter, index);
            }, 100);
        };
        /// <summary>
        /// 填充邮箱数据
        /// </summary>
        /// <param name="jq">元素</param>
        /// <param name="filter">搜索条件</param>
        /// <param name="index">索引</param>
        function getData(jq, filter, index) {
            var $jq = $(jq);
            var at = filter.lastIndexOf('@');
            var mail = filter.substr(at + 1);
            var texta = "";
            
            var dl,
                        a;
            var options = $jq.mailcomplete("options");

            if (index == 0) {
                options.onInitialize();
            }
            options.lastindex += index;
            clearTimeout(timeID);
            $panel.empty();
            filter = filter || "";
            if (mails.length > 0) {
                mails[0] = filter;
                $panel.append("<p class='tit'>请选择邮箱类型</p></p>");
                options.nowcount = 0;
                for (var i = 0; i < mails.length; i++) {
                    if (mail != "" && at >= 0 && i > 0) {
                        if (mails[i].substring(0, mail.length) != mail.replace(/\s/g, "")) {
                            continue;
                        }
                        texta = filter.substr(0, at) + (i == 0 ? "" : ("@" + mails[i]));
                        if (texta == mails[0]) {
                            continue;
                        }
                        filter = filter.substr(0, at);
                    }
                    filter = filter.replace(/\s/g, "");
                    if (filter.substr(filter.length - 1) == '@') {
                        filter = filter.substr(0, filter.length - 1);
                    }
                    select = i == options.lastindex;
                    texta = i == 0 ? mails[i] : (filter + "@" + mails[i]);
                    dl = $("<dl class='clearfix_after' style='height:20px;margin:0;padding:0;white-space: nowrap;word-break:break-all;'></dl>");
                    a = $("<a idx='" + options.nowcount + "' class='autodata' href='javascript:;'><span style='display:block;height:25px;line-height:25px;'></span></a>");
                    a.find("span").text(texta).attr("title", texta);
                    dl.append(a);
                    $panel.append(dl);
                    options.nowcount++;
                }
            }
            $panel.show();
            panelStatus = true;
            if (options.lastindex >= options.nowcount) {
                options.lastindex = 0;
            }
            else if (options.lastindex < 0) {
                options.lastindex = options.nowcount - 1;
            }
            var $el = $panel.find("[idx=" + options.lastindex + "]");

            $el.addClass("selectReg");
            options.nowText = $el.text();
        }
        /// <summary>
        /// 初始化
        /// </summary>
        /// <param name="jq">元素</param>
        function doInit(jq) {
            var $jq = $(jq);
            //var options = $jq.mailcomplete("options");

            $.fn.mailcompleteinit();
            $jq.on("keypress", onKeyPress);
            $jq.on("keyup", onKeyUp);
            $jq.on("blur", onBlur);
            $jq.on("focus", onFocus);
        }
        /// <summary>
        /// focus事件
        /// </summary>
        /// <param name="e">元素</param>
        function onFocus(e) {
            var el = e.currentTarget;
            $panel.off("click").on("click", ".autodata", [el], onClick);
            getPosition(el);
            showAutoComplete(el, 0);
        }
        /// <summary>
        /// click事件
        /// </summary>
        /// <param name="e">元素</param>
        function onClick(e) {
            var $el = $(e.currentTarget);
            var $jq = $(e.data[0]);
            var options = $jq.mailcomplete("options");

            options.nowText = "";
            $jq.val($el.text());
            options.complete = true;

            return false;
        }
        /// <summary>
        /// keypress事件
        /// </summary>
        /// <param name="e">元素</param>
        function onKeyPress(e) {
            if (e.keyCode == 13) {
                var options = $(e.currentTarget).mailcomplete("options");
                $(e.currentTarget).val(options.nowText);
                options.nowText = "";
                options.complete = true;
                options.onComplete.call($(e.currentTarget), options.complete);
                options.complete = false;
                panelStatus = false;
            }
        }
        /// <summary>
        /// keyup事件
        /// </summary>
        /// <param name="e">元素</param>
        function onKeyUp(e) {
            var jq = e.currentTarget;

            getPosition(jq);
            switch (e.keyCode) {
                case 13:
                    break;
                case 38:
                    //up
                    showAutoComplete(jq, -1);
                    break;
                case 40:
                    //down
                    showAutoComplete(jq, 1);
                    break;
                default:
                    showAutoComplete(jq, 0);
                    break;
            }
        }
        /// <summary>
        /// blur事件
        /// </summary>
        /// <param name="e">元素</param>
        function onBlur(e) {
            var $jq = $(e.currentTarget);
            var options = $jq.mailcomplete("options");

            if (panelStatus) {
                timeID = setTimeout(function () {
                    options.onComplete.call($jq, options.complete);
                    options.complete = false;
                    $panel.hide();
                    panelStatus = false;
                }, 200);
            }
        }
        /// <summary>
        /// 销毁
        /// </summary>
        /// <param name="jq">元素</param>
        /// <param name="isDeep">销毁mailcomplete的同时销毁panel</param>
        function doDestroy(jq, isDeep) {
            var $jq = $(jq);

            $jq.off("keypress", onKeyPress);
            $jq.off("keyup", onKeyUp);
            $jq.off("blur", onBlur);
            $jq.off("focus", onFocus);
            $.data(jq, "mailcomplete", null);
            if (isDeep === true) {
                $.fn.mailcompletedestroy();
            }

            return $jq;
        }
        /// <summary>
        /// panel初始化
        /// </summary>
        $.fn.mailcompleteinit = function () {
            var mailpanel = $("#mainautocomplete_panel");

            if (!mailpanel.size()) {
                $panel = $(mailCompletePanel);
                $(document.body).append($panel);
            }
            else {
                $panel = mailpanel;
            }
        };
        /// <summary>
        /// panel销毁
        /// </summary>
        $.fn.mailcompletedestroy = function () {
            var mailpanel = $("#mainautocomplete_panel");
            if (mailpanel.size()) {
                mailpanel.off("click");
                mailpanel.remove();
            }
        };
        /// <summary>
        /// 邮箱自动填充函数
        /// </summary>
        /// <param name="method">函数名</param>
        /// <param name="options">参数</param>
        $.fn.mailcomplete = function (method, options) {
            if (typeof method == "string") {
                return $.fn.mailcomplete.methods[method](this, options);
            }
            method = method || {};
            return this.each(function () {
                var data = $.data(this, "mailcomplete");
                if (data) {
                    $.extend(data.options, method);
                }
                else {
                    data = $.data(this, "mailcomplete",
                                {
                                    options: $.extend({}, $.fn.mailcomplete.defaults, $.fn.mailcomplete.parseOptions(this), method)
                                });
                    doInit(this);
                }
            });
        };
        /// <summary>
        /// 邮箱自动填充函数方法
        /// </summary>
        $.fn.mailcomplete.methods = {
            options: function (jq, key) {
                key = key || "options";
                return $.data(jq[0], "mailcomplete")[key];
            },
            destroy: function (jq, isDeep) {
                doDestroy(jq, isDeep);
            }
        };
        /// <summary>
        /// 邮箱自动填充函数参数获取函数
        /// </summary>
        $.fn.mailcomplete.parseOptions = function (jq) {
            return $.extend({}, $.parser.parseOptions(jq, [{
                showBar: "boolean",
                fixed: "boolean"
            }]));
        };
        /// <summary>
        /// 邮箱自动填充函数参数默认值
        /// </summary>
        $.fn.mailcomplete.defaults = $.extend({}, {
            complete: false,
            nowcount: 0,
            lastindex: 0,
            nowText: "",
            onInitialize: function () { },
            onComplete: function () { }
        });
    })($);
});