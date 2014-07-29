/*
* @评论功能
* 封晓
*/
define(['jquery', "plugin/jquery.parser"], function ($) {
    (function ($) {
        var atTextBoxPositionPanel = "<div id=\"attextbox_positionpanel\" style='visibility:hidden;width:185px;overflow:auto;white-space:nowrap;position:absolute;z-index:99999;background:#e5e5e5;'></div>";
        var atTextBoxPanel = "<div id=\"attextbox_panel\" style='position:absolute;z-index:99999;'></div>";
        var $positionPanel = null;
        var $panel = null;
        var timeID = 0;
        var panelStatus = false;

        /// <summary>
        /// 取得元素的属性
        /// </summary>
        /// <param name="elem">元素</param>
        /// <param name="attr">属性</param>
        function attrStyle(elem, attr) {
            if (elem.attr) {
                //若样式存在于html中,优先获取
                return elem.style[attr];
            } else if (elem.currentStyle) {
                //IE下获取CSS属性最终样式(同于CSS优先级)
                return elem.currentStyle[attr];
            } else if (document.defaultView && document.defaultView.getComputedStyle) {
                //W3C标准方法获取CSS属性最终样式(同于CSS优先级)
                //注意,此法属性原格式(text-align)获取的,故要转换一下
                attr = attr.replace(/([A-Z])/g, '-$1').toLowerCase();
                //获取样式对象并获取属性值
                return document.defaultView.getComputedStyle(elem, null).getPropertyValue(attr);
            } else {
                return null;
            }
        };
        /// <summary>
        /// 拿到光标位置
        /// </summary>
        /// <param name="e">元素</param>
        function getSelectPos(e) {
            var rtextRange = e.createTextRange();

            rtextRange.collapse(true);
            rtextRange.moveStart('character', this.textinfo.index);
            rtextRange.select();

            e.scrollTop = 10000000;
            e.scrollLeft = 10000000;
        }
        /// <summary>
        /// 拿到光标位置
        /// </summary>
        /// <param name="e">元素</param>
        function getCurPos(e) {
            if (e.selectionStart) {
                return {
                    index: e.selectionStart
                };
            }
            if (document.selection) {
                var r = document.selection.createRange();
                if (r == null) {
                    return e.value.length;
                }
                var re = e.createTextRange();
                var rc = re.duplicate();
                var index = 0;

                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);

                index = rc.text.replace(/\r/g, '').length;
                if (index == 0) {
                    index = $(e).val();
                }
                return {
                    index: rc.text.replace(/\r/g, '').length,
                    text: rc.text
                };
            }
            return {
                index: e.value.length,
                text: e.value
            };
        }
        /// <summary>
        /// 重新计算位置
        /// </summary>
        /// <param name="$jq">元素</param>
        function resize($jq) {
            var options = $jq.attextbox("options");

            options.offset = $jq.offset();
            $positionPanel.css({
                left: options.offset.left,
                top: options.offset.top + 50,
                width: $jq.outerWidth(),
                height: $jq.outerHeight() + 20
            });
        }
        /// <summary>
        /// 是否需要显示数据
        /// </summary>
        /// <param name="$jq">元素</param>
        function checkAutoComplete($jq) {
            var options = $jq.attextbox("options");
            var nowIndex = options.position;
            //取得从输入@符号以前的所有字符
            var sText = $jq.val().substr(0, nowIndex);
            //取得最后一次@符号的位置
            var at = sText.lastIndexOf('@');
            //取得最后一个字符
            var sFirst = sText.substr(nowIndex - 1, 1);
            //取得从@符号后面的字符
            sText = sText.substring(at + 1, nowIndex);
            //判断@符号的位置不是第一个
            //最后一个字符不是空或者：,:
            //开始填充
            if (at >= 0 && sFirst != " " && !sText.match(":|：") && !/[\s|\n|\r]/g.test(sText)) {
                resize($jq);
                showAutoComplete($jq, at, sText);
            }
            else {
                panelStatus = false;
                $panel.hide();
            }
        }
        /// <summary>
        /// 显示数据
        /// </summary>
        /// <param name="$jq">元素</param>
        /// <param name="nowIndex">当前索引</param>
        /// <param name="filter">条件</param>
        function showAutoComplete($jq, nowIndex, filter) {
            var options = $jq.attextbox("options");
            var sText = $jq.val().substr(0, nowIndex);
            var span = $("<span>&nbsp;</span>");
            var off = null;
            var left = 0;
            var top = 0;
            var objectinfo = {
                leftfrom: 0,
                leftto: 0,
                topfrom: 0,
                topto: 0,
                width: 0,
                height: 0
            };

            //得到当前文本框的信息
            off = $jq.offset();
            objectinfo.width = $jq.outerWidth(true);
            objectinfo.height = $jq.outerHeight(true);
            objectinfo.leftfrom = off.left;
            objectinfo.leftto = off.left + objectinfo.width;
            objectinfo.topfrom = off.top;
            objectinfo.topto = off.top + objectinfo.height;

            options.lastIndex = nowIndex;
            span.attr("class", $jq.attr("class"));
            sText = sText.replace(/\n/g, "</br>");
            sText = sText.replace(/\s/g, "&nbsp;");
            $positionPanel.html(sText);
            $positionPanel.append(span);
            off = span.offset();
            $positionPanel.scrollLeft($positionPanel[0].scrollWidth - $positionPanel.outerWidth(false));
            $positionPanel.scrollTop($positionPanel[0].scrollHeight - $positionPanel.outerHeight(true));

            left = Math.abs($positionPanel.scrollLeft() - $jq.scrollLeft());
            top = Math.abs($positionPanel.scrollTop() - $jq.scrollTop());
            left = objectinfo.width - objectinfo.leftto + off.left + objectinfo.leftfrom - left;
            top = objectinfo.height + options.lineheight - objectinfo.topto + off.top + objectinfo.topfrom - top - 25;

            $panel.css({
                left: left > objectinfo.leftto ? objectinfo.leftto : left,
                top: top > objectinfo.topto ? objectinfo.topto : top
            });
            getData($jq, filter);
        }
        /// <summary>
        /// 取得数据
        /// </summary>
        /// <param name="$jq">元素</param>
        /// <param name="filter">条件</param>
        function getData($jq, filter) {
            var options = $jq.attextbox("options");

            filter = filter || "";
            options.selected = -1;
            options.onCallData.call($jq, $panel, filter, function (count) {
                panelStatus = true;
                options.selected = 0;
                options.count = count;
            });
        }
        /// <summary>
        /// 初始化attextbox
        /// </summary>
        /// <param name="jq">元素</param>
        function doInit(jq) {
            var $jq = $(jq);

            $.fn.attextboxinit();
            $jq.on("focus", onFocus);
            $jq.on("keydown", onKeyDown);
            $jq.on("keyup click", onKeyUpAndClick);
            $jq.on("blur", onBlur);
        }
        /// <summary>
        /// focus事件
        /// </summary>
        /// <param name="e">元素</param>
        function onFocus(e) {
            var $jq = $(e.currentTarget);
            var options = $jq.attextbox("options");

            $panel.hide();
            $positionPanel.attr("class", $jq.attr("class"));
            $positionPanel.css({
                "white-space": options.nowrap,
                "font": options.font,
                "font-family": attrStyle($jq[0], "font-family"),
                "font-size": attrStyle($jq[0], "font-size")
            });
            resize($jq);
            $panel.off("click").on("click", ".attextbox_data1", [$jq], onClick);
        }
        /// <summary>
        /// keydown事件
        /// </summary>
        /// <param name="e">元素</param>
        function onKeyDown(e) {
            if (panelStatus) {
                switch (e.keyCode) {
                    case 13:
                        //case 37:
                    case 38:
                        //case 39:
                    case 40:
                        return false;
                }
            }
        }
        /// <summary>
        /// click和keyup事件
        /// </summary>
        /// <param name="e">元素</param>
        function onKeyUpAndClick(e) {
            var $jq = $(e.currentTarget);
            var options = $jq.attextbox("options");

            clearTimeout(timeID);
            if (e.keyCode) {
                switch (e.keyCode) {
                    case 13:
                    case 38:
                    case 40:
                        return options.onKeyClick.call($jq, e.keyCode);
                        break;
                    //                    case 13:  
                    //                        if (options.selected >= 0 && panelStatus) {  
                    //                            $panel.find("[idx=" + options.selected + "]").trigger("click");  
                    //                            panelStatus = false;  
                    //                        }  
                    //                        return false;  
                    //                    case 38:  
                    //                        if (options.selected == 0) {  
                    //                            options.selected = options.count - 1;  
                    //                        }  
                    //                        else {  
                    //                            options.selected--;  
                    //                        }  
                    //                        $panel.find(".attextbox_data1").removeClass("dropListselect");  
                    //                        $panel.find("[idx=" + options.selected + "]").addClass("dropListselect");  
                    //                        return false;  
                    //                    case 40:  
                    //                        if (options.selected == options.count - 1) {  
                    //                            options.selected = 0;  
                    //                        }  
                    //                        else {  
                    //                            options.selected++;  
                    //                        }  
                    //                        $panel.find(".attextbox_data1").removeClass("dropListselect");  
                    //                        $panel.find("[idx=" + options.selected + "]").addClass("dropListselect");  
                    //                        return false;  
                }
            }
            options.textinfo = getCurPos($jq[0]);
            options.offset = $jq.offset();
            options.position = options.textinfo.index;
            //if (options.position != options.lastIndex) {
            checkAutoComplete($jq);
            options.lastIndex = options.position;
            //}
        }
        /// <summary>
        /// blur事件
        /// </summary>
        /// <param name="e">元素</param>
        function onBlur(e) {
            clearTimeout(timeID);
            timeID = setTimeout(function () {
                $panel.hide();
                panelStatus = false;
            }, 300);
        }
        /// <summary>
        /// click事件
        /// </summary>
        /// <param name="e">元素</param>
        function onClick(e) {
            var $el = $(e.currentTarget).find("span");
            var $jq = $(e.data[0]);
            var options = $jq.attextbox("options");
            var sText = $jq.val();
            var sTextFront = sText.substr(0, options.position);
            var sTextBack = sText.substr(options.position);
            var at = sTextFront.lastIndexOf('@');
            var space = sTextBack.substr(0, 1);

            if (space != " ") {
                sTextBack = " " + sTextBack;
            }
            sTextFront = sTextFront.substring(0, at + 1);
            sText = sTextFront + $el.text() + sTextBack;
            $jq.val(sText);
            options.lastIndex = options.textinfo.index + $el.text().length + 2;
            //func.panelStatus(false);
            $jq.focus();

            return false;
        }
        /// <summary>
        /// 销毁
        /// </summary>
        /// <param name="jq">元素</param>
        /// <param name="isDeep">销毁mailcomplete的同时销毁panel</param>
        function doDestroy(jq, isDeep) {
            var $jq = $(jq);

            $jq.off("focus", onFocus);
            $jq.off("keydown", onKeyDown);
            $jq.off("keyup click", onKeyUpAndClick);
            $jq.off("blur", onBlur);
            if (isDeep === true) {
                $.fn.attextboxdestroy();
            }

            return $jq;
        }
        /// <summary>
        /// panel初始化
        /// </summary>
        $.fn.attextboxinit = function () {
            var $attextboxpanel = $("#attextbox_panel");
            var $attextboxpositionpanel = $("#attextbox_positionpanel");

            if (!$attextboxpanel.size()) {
                $panel = $(atTextBoxPanel);
                $(document.body).append($panel);
            }
            else {
                $panel = $attextboxpanel;
            }
            if (!$attextboxpositionpanel.size()) {
                $positionPanel = $(atTextBoxPositionPanel);
                $(document.body).append($positionPanel);
            }
            else {
                $positionPanel = $attextboxpositionpanel;
            }
        };
        /// <summary>
        /// panel销毁
        /// </summary>
        $.fn.attextboxdestroy = function () {
            var $attextboxpanel = $("#attextbox_panel");
            var $attextboxpositionpanel = $("#attextbox_positionpanel");

            if ($attextboxpanel.size()) {
                $attextboxpanel.off("click");
                $attextboxpanel.remove();
            }
            if ($attextboxpositionpanel.size()) {
                $attextboxpositionpanel.remove();
            }
        };
        /// <summary>
        /// 取得当前状态
        /// </summary>
        $.fn.attextboxlocked = function () {
            return panelStatus;
        };
        /// <summary>
        /// 邮箱自动填充函数
        /// </summary>
        /// <param name="method">函数名</param>
        /// <param name="options">参数</param>
        $.fn.attextbox = function (method, options) {
            if (typeof method == "string") {
                return $.fn.attextbox.methods[method](this, options);
            }
            method = method || {};
            return this.each(function () {
                var data = $.data(this, "attextbox");
                if (data) {
                    $.extend(data.options, method);
                }
                else {
                    data = $.data(this, "attextbox", {
                        options: $.extend({}, $.fn.attextbox.defaults, $.fn.attextbox.parseOptions(this), method)
                    });
                    doInit(this);
                }
            });
        };
        /// <summary>
        /// 邮箱自动填充函数方法
        /// </summary>
        $.fn.attextbox.methods = {
            options: function (jq, key) {
                key = key || "options";
                return $.data(jq[0], "attextbox")[key];
            },
            destroy: function (jq, isDeep) {
                doDestroy(jq, isDeep);
            }
        };
        /// <summary>
        /// 邮箱自动填充函数参数获取函数
        /// </summary>
        $.fn.attextbox.parseOptions = function (jq) {
            return $.extend({}, $.parser.parseOptions(jq, [{
                showBar: "boolean",
                fixed: "boolean"
            }]));
        };
        /// <summary>
        /// 邮箱自动填充函数参数默认值
        /// </summary>
        $.fn.attextbox.defaults = $.extend({}, {
            nowrap: "nowrap",
            font: "inherit",
            onCallData: function ($panel, filter, callback) { },
            onKeyClick: function (keycode) { },
            lastIndex: 0,
            lineheight: 0,
            position: 0,
            offset: {},
            count: 0,
            selected: -1
        });
    })($);
});