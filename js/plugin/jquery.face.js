/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-2-26
 * Time: 下午2:46
 * To change this template use File | Settings | File Templates.
 * desc : 表情插件
 */

define(["jquery", "plugin/face.lib"], function ($, facelib) {
    //jquery plugin
    // 获取文本框 光标位置
    $.fn.extend({
        getCurPos: function () {
            var e = $(this).get(0);

            if (e.selectionStart) {    //FF
                return e.selectionStart;
            }
            if (document.selection) {    //IE
                var r = document.selection.createRange();
                if (r == null) {
                    return e.value.length;
                }
                var re = e.createTextRange();
                var rc = re.duplicate();
                re.moveToBookmark(r.getBookmark());
                rc.setEndPoint('EndToStart', re);
                return rc.text.length;
            }
            // e.focus();
            return e.value.length;
        },
        setCurPos: function (pos) {
            var e = $(this).get(0);

            if (e.setSelectionRange) {
                e.setSelectionRange(pos, pos);
            } else if (e.createTextRange) {
                var range = e.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
            //  e.focus();
        }
    });

    //create Class Face
    // option {source: "", textarea:""}
    var Face = function () {
        this.el = $("<div class='window-face'><div class='face-header'><a href='javascript:;'>x</a></div></div>");
        $(document.body).append(this.el);
        this.onEmotionClick();
        this.created = false;

    };

    Face.prototype.createEl = function () {

    };
    Face.prototype.create = function () {
        var html = "<div class='face-container'>";
        for (var n in facelib) {
            html += "<a title='" + n + "' href='javascript:void(0);'><img src='" + facelib[n] + "' title='" + n + "'/></a>";
        }
        html += "</div>";
        this.el.append(html);
        this.created = true;

    };

    //add click event listener
    Face.prototype.onEmotionClick = function () {
        var _this = this;
        this.el.on("click", function (event) {
            event.stopPropagation();
            var $img = $(event.target);
            var title = $img.attr("title");
            if (!title) return;
            title = "[" + title + "]";
            _this.textarea.focus();
            var pos = _this.textarea.getCurPos(),
                val = _this.textarea.val();

            var new_val;
            if (pos == 0) {
                new_val = val + title;
                pos = new_val.length - 1;
            } else {
                new_val = val.substring(0, pos) + title + val.substring(pos);
            }
            _this.textarea.val(new_val);
            _this.textarea.setCurPos(pos + title.length);
            _this.textarea.change();
            _this.hide();
        });

        this.el.find(".face-header").mouseover(function () {
            $(this).addClass("hover");
        })
            .mouseout(function () {
                $(this).removeClass("hover");
            })
            .click(function () {
                _this.hide();
            });

    };

    Face.prototype.setPosition = function (left, top) {
        this.el.css({
            left: left,
            top: top,
            zIndex: 100000
        });
    };

    Face.prototype.setWidth = function (width) {
        this.el.width(width);
    };
    Face.prototype.setTextarea = function (textarea) {
        this.textarea = textarea;
    };

    Face.prototype.show = function () {
        if (!this.created) {
            this.create();
        }
        $(document).bind("click", this, this.hide);

        this.el.show();
    };

    Face.prototype.hide = function (event) {

        var _this = this;

        if (event && event.data) {
            _this = event.data;
        }
        _this.el.hide();
        $(document).unbind("click", _this.hide);
    };


    //single module, only one instance;
    var instance=null;

    //event for srouce,easy to bind and unbind;
    function addEvent(event) {

        event.stopPropagation();
        var me = $(this);
        var left = me.offset().left,
            top = me.offset().top;
        instance.setPosition(left, top + me.height());
        instance.setTextarea(event.data.textarea);
        instance.setWidth(event.data.width);
        instance.show();
    }

    $.fn.face = function(options){
        //this -> textarea
        var defaults = {
            target:"",              //触发显示表情框的元素
            targetEvent:"click",  //触发事件
            width:330               //默认宽度
        };
        options = $.extend(defaults, options);
        if (!instance) instance = new Face();
        var method = options.targetEvent;
        $(options.target).unbind(options.targetEvent, addEvent)
            .bind(options.targetEvent, { textarea: this, width: options.width}, addEvent);
        return this;
    };

    var face = {};
    //comment interface ,add event for srouce and show emotion to textarea;
    face.makeFace = function (srouce, textarea, option) {
       $(textarea).face({target:srouce});
    };
    //xxx[xx]xxx -> xxx<img src="xx.gif"/>xxx
    face.getHtml = function (str) {
        var reg = /(\[([^\]\[]*?)\])/g;

        var html = str.replace(reg, function () {
            var arg = arguments;
            if (facelib[arg[2]]) {
                return "<img class='face-image' title='" + arg[2] + "' src='" + facelib[arg[2]] + "'/>";
            }
            return arg[1];
        });

        return html;
    };

    return face;
});

