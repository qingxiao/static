/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-12
 * Time: 上午11:19
 * To change this template use File | Settings | File Templates.
 */
define(['jquery'], function () {
    var options = {
        /*
        cover:false,
        externalLinks:false,
        links:false,
        trimOptions:false,*/
        customClass: "",
        defaultLabel: false,
        openEvent: "mouseenter",
        closeEvent: "mouseleave",
        delay: "0", //ms
        muti: false,
        onDrop: function () { },
        onClose: function () { },
        onChange: function () { },
        isCreate: false,
        options: [
            { name: "用户", value: "user" },
            { name: "声音", value: "voice" },
            { name: "专辑", value: "album" }
        ],
        filed: { name: "name", value: "value", selected: "voice" }
    };

    var pub = {
        val: function (data) {
            var $el = $(this),
                $selecterSelected = $el.find(".selecter-selected");
            if (typeof data === 'object') {
                $selecterSelected.attr("data-value", data.value).
                    text(data.name);
                return $el;
            } else if (typeof data === 'string') {
                var $option = $el.find(".selecter-item[data-value=" + data + "]");
                var name = $option.text();
                $selecterSelected.attr("data-value", data);
                $selecterSelected.find(".selecter-text").text(name);
                return $el;
            } else {
                return $.trim($selecterSelected.attr("data-value"));
            }
        },
        text:function(){
            var $el = $(this),
                $selecterSelected = $el.find(".selecter-selected");
            return  $.trim($selecterSelected.find(".selecter-text").text());
        },
        create: function (opts) {
            opts.isCreate = true;
            _init.call(this, opts);
        },
        del: function (id) {
            var $el = $(this),
                $option = $el.find(".selecter-item[data-value=" + id + "]");
            $option.remove();
        },
        add: function (data, position) {
            var $el = $(this),
                $option = $el.find(".selecter-item").eq(0),
                $clone = $option.clone().removeClass("selected"), size;
            if (size = $option.size()) {
                $clone.attr("data-value", data.value).html(data.name);
                if (position == undefined || size <= position) {
                    $option.parent().append($clone);
                } else {
                    if (position > 0)
                        $clone.insertBefore($option.parent().find("li:eq(" + (position - 1) + ")"));
                    else if (position == -1) {
                        $clone.insertBefore($option.parent().find("li:eq(" + (size - 2) + ")"));
                    }
                }
            }
        },
        edit: function (data) {
            var $el = $(this),
                $option = $el.find(".selecter-item[data-value=" + data.value + "]");

            $option.text(data.name);
        }
    };

    function cutString($el){
        // $el  selecter-selected
        var $text = $el.find(".selecter-text"),
            $arrow = $el.find(".selecter-arrow"),
            str = $.trim($text.text()),
            p_width = $el.width(),
            t_width = $text.width(),
            a_width = $arrow.outerWidth(true);

        var i=0;
        while(p_width && p_width < t_width + a_width){
            i++;
            if(i>=40) break;
            str = str.substring(0, str.length-1);
            $text.text(str);
            t_width = $text.width();
        }
        if(i>0){
            $text.text( str.substring(0, str.length-3) + "...");
        }

    }

    $.fn.selecter = function (method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    function _init(opts) {
        opts = opts || {};

        // Define settings
        var settings = $.extend({}, options, opts);

        // Apply to each element
        var $items = $(this),
            isCreate = settings.isCreate;
        for (var i = 0, count = $items.length; i < count; i++) {
            var $item = $items.eq(i);
            if (!$item.attr("inited")) {
                $item.attr("inited", true);
                if (isCreate) {
                    _create($item, settings);
                } else {
                    _build($item, settings);
                }
            }
        }
        return $items;
    }



    function _create($selectEl, opts) {
        if (!opts.options) return;
        var optionsHtml = ' <div class="selecter-options "><ul>',

            selectedHtml = '<div class="selecter-selected" data-value="{value}">' +
                    '<span class="selecter-text">{name}</span>' +
                    '<em class="selecter-arrow">◆</em>' +
                    '</div>',
            options = opts.options,
            filed = opts.filed,
            selectData = { value: "", name: opts.defaultLabel || "" };
        for (var i = 0, l = options.length; i < l; i++) {
            var op = options[i],
                //name = decodeURIComponent(op[filed.name]),
                name = op[filed.name],
                value = op[filed.value],
                selected = filed.selected,
                extraCls = "";
            if (selected == value) {
                extraCls = " selected";
                selectData = {
                    value: value,
                    name: name
                };
            }
            optionsHtml += '<li data-value="' + value + '" class="selecter-item ' + extraCls + '">' + name + '</li>';
        }
        optionsHtml += "</ul></div>";
        selectedHtml = selectedHtml.replace("{value}", selectData.value).replace("{name}", selectData.name);

        $selectEl.append(selectedHtml + optionsHtml);
        $selectEl.addClass("selecter");
        $selectEl.addClass(opts.customClass);
        _bindEvents($selectEl, opts);
    }

    function _build($selectEl, opts) {
        $selectEl.addClass(opts.customClass);

        _bindEvents($selectEl, opts);
    }

    function _bindEvents($selectEl, opts) {

        var els = {
            $select: $selectEl,
            $selectSelected: $selectEl.find(".selecter-selected"),
            $selectOptions: $selectEl.find(".selecter-options")
        };
        var selectValue = els.$selectSelected.attr("data-value");
        if (selectValue) {
            els.$selectOptions.find("[data-value=" + selectValue + "]").addClass("selected");
        }
        var delayTimer = 0,
            _this = this;
        //打开
        var _openFn = function () {
            if (delayTimer) {
                clearTimeout(delayTimer);
            }
            els.$select.addClass("open");
            opts.onDrop.call(_this);
        };
        var _closeFn = function () {
            if (opts.delay) {
                delayTimer = setTimeout(function () {
                    els.$select.removeClass("open");
                }, opts.delay);
            } else {
                els.$select.removeClass("open");
            }
            opts.onClose.call(_this);
        };
        if (false && opts.openEvent == "mouseenter" && opts.closeEvent == "mouseleave" && opts.delay == 0) {
            $selectEl.addClass("selecter-hover");
        }
        else {
            //打开
            $selectEl.removeClass("selecter-hover");
            els.$select.on(opts.openEvent, function (e) {
                e.stopPropagation();
                _openFn();
            });
            //关闭
            var filterEvt = {
                mouseleave: 1,
                mouseout: 1
            };
            if (!filterEvt[opts.closeEvent]) {
                $(document).on(opts.closeEvent, _closeFn);
            } else {
                els.$select.on(opts.closeEvent, _closeFn);
            }
        }

        //选中
        els.$select.on("click", ".selecter-item", function (e) {
            e.stopPropagation();
            els.$select.removeClass("open");
            var $item = $(this);
            var value = $item.attr("data-value");
            if (opts.onChange.call($item,value) === false) {
                return;
            }
            if ($item.hasClass("selected")) {
                return;
            }
            if (!opts.muti) {
                $item.parent().find(".selected").removeClass("selected");
            }
            $item.addClass("selected");

            els.$selectSelected.attr({ "data-value": value });
            els.$selectSelected.find(".selecter-text").text($item.text());
            els.$select.find("input").val(value);
            cutString(els.$selectSelected);
            els.$select.trigger("change");
        });
        els.$select.on("mouseenter", ".selecter-item", function (e) {
            _openFn();
        });
        cutString(els.$selectSelected);
    }

    function _close($selectEl, timer, delay) {

    }
});