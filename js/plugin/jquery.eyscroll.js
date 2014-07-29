/* Copyright (c) 2013 fengxiao
*  CreateDate: 2013-02-19 11:03
*  Version: 1.0
*  Requires: $ 1.9，jquery.mlusewheel.js 3.0，jquery.easydrag.js
*  $("#div1").eyscroll(options);
*/
define(['jquery', 'plugin/jquery.easydrag', 'plugin/jquery.mousewheel', 'plugin/jquery.parser'], function ($) {
    (function ($) {
        /// <summary>
        /// 获取基本信息
        /// <param name="jq">元素对象</param> 
        /// </summary>
        function doGetInfo(jq, options) {
            var $jq = $(jq);
            var offset = $jq.position();
            var scrollHeight = jq.scrollHeight;
            var width = $jq.outerWidth();
            var height = $jq.outerHeight();

            options.showBar = scrollHeight > height;
            height = height - 2 * options.borderWidthL - 0 * options.borderWidth;
            options.panelHeight = height;
            options.barHeight = height - (scrollHeight - height);
            options.barHeight = (options.barHeight < options.minBlockHeight ? options.minBlockHeight : options.barHeight);
            options.pix = (scrollHeight - options.panelHeight) / (scrollHeight - height);
            options.pix1 = (scrollHeight - height) / (height - options.barHeight);
            if (options.pix1 < 1) options.pix1 = 1;

            return {
                height: height,
                width: width,
                offset: offset
            };
        }
        /// <summary>
        /// 初始化控件内容
        /// <param name="infos">基本信息</param> 
        /// <param name="$scrollBar">scrollbar元素</param> 
        /// <param name="$jq">元素</param> 
        /// <param name="$scrollBarBlock">scrollBarBlock元素</param> 
        /// <param name="options">参数</param> 
        /// <param name="top">bool</param> 
        /// </summary>
        function doSetObjInfos(infos, $scrollBar, $jq, $scrollBarBlock, options, top) {
            $scrollBar.addClass(options.barClass).attr("data-type", "eyscroll-bar").css({
                width: options.barWidth,
                height: infos.height,
                position: "absolute",
                display: (options.showBar) ? "" : "none", // && !options.autoVisible
                top: infos.offset.top + 1 * options.borderWidth + options.borderWidthL,
                left: infos.offset.left + infos.width - options.barWidth - options.borderWidthL
            });
            if (!options.showBar) {
                $jq.scrollTop(0);
            }
            $scrollBarBlock.attr("data-type", "eyscroll-barblock").css({
                width: options.barWidth,
                height: options.barHeight,
                position: "absolute",
                left: 0
            });
            if (top === true) {
                $scrollBarBlock.css("top", 0);
            }
            $scrollBarBlock.find(".barblock-center").css({
                height: options.barHeight - 7
            });
            if (options.autoVisible && options.showBar) {
                doSetVisible($jq[0], false);
                $jq.off("mouseenter").on("mouseenter", function () {
                    if (options.showBar) {
                        options.mouseEnter = true;
                        $jq.eyscroll("setVisible", true);
                    }
                }).off("mouseleave").on("mouseleave", function () {
                    options.mouseEnter = false;
                    if (options.canHide) {
                        $jq.eyscroll("setVisible", false);
                    }
                });
            }
        }
        /// <summary>
        /// 初始化scroll对象
        /// <param name="jq">元素对象</param> 
        /// </summary>
        function doInit(jq) {
            var $jq = $(jq);
            var options = $jq.eyscroll("options");
            var $scrollBar = $("<div></div>");
            var $scrollBarBlock = $("<div canLeftMove='false'><em class='barblock barblock-top'/><em class='barblock barblock-center'/><em class='barblock barblock-bottom'/></div>");
            var infos = doGetInfo(jq, options);

            $jq.addClass(options.eyscrollCls);
            $scrollBar.append($scrollBarBlock);
            $jq.append($scrollBar);
            doSetObjInfos(infos, $scrollBar, $jq, $scrollBarBlock, options, true);
            $jq.scrollTop(0);
            $scrollBarBlock.easydrag(true, options.autoBindEvent);
            $scrollBarBlock.beforeDrag(function (e, element) {
                if (!options.autoBindEvent) {
                    $scrollBarBlock.bindEvent();
                }
            });
            $scrollBarBlock.ondrag(function (e, element) {
                doDrag(e, element, $jq, options);
            });
            $scrollBarBlock.ondrop(function (e, element) {
                options.canHide = true;
                if (!options.autoBindEvent) {
                    $scrollBarBlock.unBindEvent();
                }
                if (!options.mouseEnter && options.autoVisible) {
                    $jq.eyscroll("setVisible", false);
                }
            });
            $jq.mousewheel(function (event, delta) {
                var scrollTop = $(this).scrollTop();

                if (delta > 0) {
                    if (scrollTop == 0) return;
                } else {
                    if (scrollTop / options.pix1 >= $(this).outerHeight()) return;
                }
                $(this).eyscroll("setHeight", {
                    delta: delta,
                    scrollTop: scrollTop
                });
            });
        }
        /// <summary>
        /// 对象resize事件
        /// <param name="e">元素对象</param> 
        /// </summary>
        function doResize(e, isToTop) {
            var jq = e.target;
            var $jq = $(jq);
            var options = $jq.eyscroll("options");

            if (options) {
                var infos = {};
                var $scrollBar, $scrollBarBlock;
                $scrollBar = $jq.find("[data-type='eyscroll-bar']");
                $scrollBarBlock = $jq.find("[data-type='eyscroll-barblock']");
                infos = doGetInfo(jq, options);
                doSetObjInfos(infos, $scrollBar, $jq, $scrollBarBlock, options);
                if (isToTop === true) {
                    $scrollBarBlock.css("top", 0);
                }
                doDrag(null, $scrollBarBlock, $jq, options);
                options.canHide = true;
            } else {
                $jq.eyscroll();
            }
        }
        /// <summary>
        /// 滑块滑动事件
        /// <param name="e"></param> 
        /// <param name="element">元素对象</param> 
        /// <param name="$jq">对象</param> 
        /// <param name="options">参数</param> 
        /// </summary>
        function doDrag(e, element, $jq, options) {
            var $el = $(element);
            var position = $el.position();
            var top = position.top;

            options.canHide = false;
            if (top < 0) {
                top = 0;
            } else if (top + (options.barHeight > 0 ? options.barHeight : options.minBlockHeight) > options.panelHeight) {
                top = options.panelHeight - (options.barHeight > 0 ? options.barHeight : options.minBlockHeight);
            }
            $el.css("top", top);
            if (top > 0) {
                top = top + options.step / options.pix;
            }
            $jq.scrollTop(top * options.pix1);
        }
        /// <summary>
        /// 滚动条高度变化
        /// <param name="jq">元素对象</param> 
        /// <param name="refs">参数对象</param> 
        /// </summary>
        function doSetHeight(jq, refs) {
            var $jq = $(jq);
            var options = $jq.eyscroll("options");
            var scrollTo = refs.scrollTop / options.pix1 - refs.delta * options.step, scrollTo1 = 0;

            scrollTo = scrollTo + options.step / options.pix * -1 * refs.delta;
            scrollTo1 = scrollTo * options.pix1;

            if (Math.abs(refs.scrollTop - scrollTo1) > options.barHeight * 0.75) {
                scrollTo = refs.scrollTop / options.pix1 - refs.delta * options.barHeight / options.pix1;
            }

            $jq.scrollTop(scrollTo * options.pix1);
            if (scrollTo < 0) {
                $jq.scrollTop(0);
                scrollTo = 0;
            }
            if (scrollTo + (options.barHeight > 0 ? options.barHeight : options.minBlockHeight) >= options.panelHeight) {
                $jq.scrollTop(options.panelHeight * options.pix1);
                scrollTo = options.panelHeight - (options.barHeight > 0 ? options.barHeight : options.minBlockHeight);
            }
            $jq.find("[data-type='eyscroll-barblock']").css({
                top: scrollTo
            });
        }
        /// <summary>
        /// 设置滚动条显示隐藏
        /// <param name="jq">元素对象</param> 
        /// <param name="visible">bool</param> 
        /// </summary>
        function doSetVisible(jq, visible) {
            var $jq = $(jq);

            if (!visible) {
                $jq.find("[data-type='eyscroll-bar']").stop().fadeOut();
            } else {
                $jq.find("[data-type='eyscroll-bar']").fadeIn();
            }
        }
        /// <summary>
        /// 销毁scroll对象
        /// <param name="jq">元素对象</param>
        /// </summary>
        function doDestroy(jq) {
            var $jq = $(jq);
            var $bar = $jq.find("[data-type='eyscroll-bar']");

            $jq.off("resize");
            $jq.unmousewheel(null);
            $jq.off("mouseenter").off("mouseleave");
            $bar.empty().remove();
            $.data(jq, "eyscroll", null);
            $.fn.easydrag_release($bar.attr("id"));
        }
        /// <summary>
        /// scroll方法
        /// <param name="method">方法</param> 
        /// <param name="options">参数对象</param> 
        /// </summary>
        $.fn.eyscroll = function (method, options) {
            if (typeof method == "string") {
                var curMethod = $.fn.eyscroll.methods[method];

                if (curMethod && $.isFunction(curMethod)) {
                    return curMethod(this, options);
                }
                else {
                    return this;
                }
            }
            method = method || {};
            return this.each(function () {
                var data = $.data(this, "eyscroll");
                if (data) {
                    $.extend(data.options, method);
                } else {
                    data = $.data(this, "eyscroll", {
                        options: $.extend({}, $.fn.eyscroll.defaults, $.fn.eyscroll.parseOptions(this), method)
                    });
                    doInit(this);
                }

                return this;
            });
        };
        /// <summary>
        /// scroll方法集合
        /// </summary>
        $.fn.eyscroll.methods = {
            /// <summary>
            /// scroll方法-获取data中参数
            /// <param name="jq">元素对象</param> 
            /// <param name="key">参数名称</param> 
            /// </summary>
            options: function (jq, key) {
                if (jq.size()) {
                    key = key || "options";
                    var data = $.data(jq[0], "eyscroll");

                    if (data) {
                        return data[key];
                    } else {
                        return null;
                    }
                }
            },
            /// <summary>
            /// 滚动条高度变化
            /// <param name="jq">元素对象</param> 
            /// <param name="refs">参数对象</param> 
            /// </summary>
            setHeight: function (jq, refs) {
                if (jq.size()) {
                    return doSetHeight(jq[0], refs);
                }
            },
            /// <summary>
            /// 设置滚动条显示隐藏
            /// <param name="jq">元素对象</param> 
            /// <param name="visible">bool</param> 
            /// </summary>
            setVisible: function (jq, visible) {
                if (jq.size()) {
                    return doSetVisible(jq[0], visible);
                }
            },
            /// <summary>
            /// 销毁scroll对象
            /// <param name="jq">元素对象</param> 
            /// </summary>
            destroy: function (jq) {
                if (jq.size()) {
                    return doDestroy(jq[0]);
                }
            },
            /// <summary>
            /// 重置scroll对象
            /// <param name="jq">元素对象</param> 
            /// <param name="isToTop">是否滚到头部</param> 
            /// </summary>
            reset: function (jq, isToTop) {
                if (jq.size()) {
                    return doResize({
                        target: jq[0]
                    }, isToTop);
                }
            }
        };
        /// <summary>
        /// scroll方法参数获取
        /// </summary>
        $.fn.eyscroll.parseOptions = function (jq) {
            return $.extend({}, $.parser.parseOptions(jq, [{ autoResize: "boolean", autoBindEvent: "boolean", autoVisible: "boolean", showBar: "boolean", minBlockHeight: "number", borderWidth: "number", barWidth: "number", step: "number"}]));
        };
        /// <summary>
        /// scroll方法默认参数
        /// </summary>
        $.fn.eyscroll.defaults = $.extend({}, {
            canHide: true, //系统变量
            pix: 1, //系统变量
            pix1: 1, //系统变量
            autoResize: false, //系统变量
            autoBindEvent: false, //是否自动绑定easydrag事件
            minBlockHeight: 20, //滚动块的最小高度
            eyscrollCls: 'eyscroll', //滚动条容器css
            borderWidthL: 1, //左右margin值
            borderWidth: 1, //上下marign值
            barWidth: 9, //滚动条的宽度
            barClass: 'eyscroll-bar', //滚动条css
            step: 2, //没滚动一步得移动量
            autoVisible: true, //自动隐藏显示滚动条
            showBar: true //显示滚动条
        });
    })($);
    /// <summary>
    /// div支持resize事件
    /// </summary>
    //(function ($, h, c) { var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow"; e[b] = 250; e[f] = true; $.event.special[j] = { setup: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.add(l); $.data(this, d, { w: l.width(), h: l.height() }); if (a.length === 1) { g() } }, teardown: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.not(l); l.removeData(d); if (!a.length) { clearTimeout(i) } }, add: function (l) { if (!e[f] && this[k]) { return false } var n; function m(s, o, p) { var q = $(this), r = $.data(this, d); r.w = o !== c ? o : q.width(); r.h = p !== c ? p : q.height(); n.apply(this, arguments) } if ($.isFunction(l)) { n = l; return m } else { n = l.handler; l.handler = m; } } }; function g() { i = h[k](function () { a.each(function () { var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d); if (m !== o.w || l !== o.h) { n.trigger(j, [o.w = m, o.h = l]) } }); g() }, e[b]) } })($, this);
});