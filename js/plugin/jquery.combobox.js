/* Copyright (c) 2013 fengxiao *  CreateDate: 2013-02-19 11:03 *  Version: 1.0 *  Requires: $ 1.9，jquery.mlusewheel.js 3.0，jquery.easydrag.js *  $("#div1").combobox(options); */
define(['jquery', 'plugin/jquery.parser'], function ($) {
    (function ($) {
        /// <summary>
        /// 初始化combobox对象
        /// <param name="jq">元素对象</param> 
        /// </summary>
        function doInit(jq) {
            var $jq = $(jq);
            var options = $jq.combobox("options");
//            var htmls = [];
//            var $title = null;
//            var $panel = null;
            $jq.empty();
            options.titleView = new options.TitleView({
                model: new Backbone.Model({ text: decodeURIComponent( options.defaultText) })
            });
            options.panelView = new options.PanelView({
                model: new Backbone.Model({})
            });
            options.ids = options.sids.split(',');
            options.panelView.$jq = $jq;
            options.panelView.model.set("onSaveNew", options.onSaveNew);
            options.panelView.model.set("onChangeGroups", options.onChangeGroups);
            options.panelView.model.set("onBeforeShowGroups", options.onBeforeShowGroups);
            options.panelView.titleView = options.titleView;
            $jq.append(options.titleView.render());
            $jq.append(options.panelView.render());
        }
        /// <summary>
        /// 初始化combobox对象数据
        /// <param name="jq">元素对象</param> 
        /// <param name="values">数组数据</param> 
        /// </summary>
        function doInitData(jq, values) {
            var $jq = $(jq);
            var options = $jq.combobox("options");
            if (values) {
                options.values = values;
            }
            options.panelView.doInitData(options.values, options.ids);
        }
        function showPanel(jq) {
            var $jq = $(jq);
            var options = $jq.combobox("options");
            options.titleView.$a().click();
        }
        /// <summary>
        /// scroll方法
        /// <param name="method">方法</param> 
        /// <param name="options">参数对象</param> 
        /// </summary>
        $.fn.combobox = function (method, options) {
            if (typeof method == "string") {
                var curMethod = $.fn.combobox.methods[method];
                if (curMethod && $.isFunction(curMethod)) {
                    return curMethod(this, options);
                }
                else {
                    return this;
                }
            }
            method = method || {};
            return this.each(function () {
                var data = $.data(this, "combobox");
                if (data) {
                    $.extend(data.options, method);
                } else {
                    data = $.data(this, "combobox", {
                        options: $.extend({}, $.fn.combobox.defaults, $.fn.combobox.parseOptions(this), method)
                    });
                    doInit(this);
                }
                return this;
            });
        };
        /// <summary>
        /// scroll方法集合
        /// </summary>
        $.fn.combobox.methods = {
            /// <summary>
            /// scroll方法-获取data中参数
            /// <param name="jq">元素对象</param> 
            /// <param name="key">参数名称</param> 
            /// </summary>
            options: function (jq, key) {
                if (jq.size()) {
                    key = key || "options";
                    return $.data(jq[0], "combobox")[key];
                }
            },
            setDatas: function (jq, values) {
                if (jq.size()) {
                    doInitData(jq, values);
                }
            },
            showPanel: function (jq) {
                if (jq.size()) {
                    return showPanel(jq[0]);
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
            }
        };
        /// <summary>
        /// scroll方法参数获取
        /// </summary>
        $.fn.combobox.parseOptions = function (jq) {
            return $.extend({}, $.parser.parseOptions(jq, [{
                values: "array",
                sids: "string",
                uid: "number"
            }]));
        };
        /// <summary>
        /// scroll方法默认参数
        /// </summary>
        $.fn.combobox.defaults = $.extend({}, {
            values: [],
            ids: [],
            PanelView: null,
            TitleView: null,
            panelView: null,
            titleView: null,
            isLoadGroups: false,
            sids: "",
            uid: 0,
            onSaveNew: function (title, callback) {
                //alert(title);
                callback(new Backbone.Model({
                    id: 10,
                    title: title
                }));
            },
            onChangeGroups: function (ids, isAutoPush, callback) {
                var _this = this;
                var options = $(_this).combobox("options");
                alert(ids.join(',') + isAutoPush);
                options.ids = ids;
                callback();
            },
            onBeforeShowGroups: function () {
                var _this = this;
                var options = $(_this).combobox("options");
                if (!options.isLoadGroups) {
                    setTimeout(function () {
                        options.isLoadGroups = true;
                        $(_this).combobox("setDatas", [{ title: "必听组", id: -1, checked: false }, { title: "1", id: 1, checked: false}]);
                        $(_this).combobox("showPanel");
                    }, 2000);
                } else {
                    $(_this).combobox("setDatas", [{ title: "必听组", id: -1, checked: false }, { title: "1", id: 1, checked: false }, { title: "2", id: 2, checked: false }, { title: "3", id: 3, checked: false}]);
                }
                return options.isLoadGroups;
            },
            defaultText: "未分组"
        });
    })($);
});