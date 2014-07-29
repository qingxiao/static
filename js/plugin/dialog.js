/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-5-22
 * Time: 下午1:30
 * To change this template use File | Settings | File Templates.
 */
/*   API
 @config:
 group:false, //分组  同组的dialog只能打开最后一个
 width:'',    //宽度
 fixed:true,  //定位
class:"", //最外层div class
 content:"",   // 内容  dialog_body里面
 onClose:function(){},   //右上角关闭回调
 autoClose:false,        //允许自动关闭
 time:3000,              //自动关闭延时
 overlayer:{
 clickClose:true,    //点击遮罩关闭dialog
 opacity:0.1         //遮罩透明度
 },
 template:{
 dialog:'<div id="" class="gPopup"></div>',
 dialog_mask:'<div class="mask"></div>',
 dialog_content:'<div class="con"></div>',
 dialog_close:'<div class="close"></div>',

 dialog_header:'<div class="hd"></div>',
 dialog_caption:'<strong class="caption"></strong>',
 dialog_body:'<div class="bd"></div>',
 }
 //////////////////////////////////////html结构////////////////////////////////////
 <div  class="gPopup dialogClass">
 <div class="mask"></div>
 <div class="con">
 <div class="hd"><strong class="caption">caption</strong></div>
 <div class="bd">content</div>
 </div>
 <div class="close"></div>
 </div>
 //////////////////////////////////////html结构////////////////////////////////////
 @method:
 open:   打开
 close:    关闭
 getEl:    获取dialog dom
 setPosition:  设置位置(居中)，自适应高度
 setCaption:  设置标题
 setBody:    设置内容
 */
define(["jquery", "helper", "plugin/jquery.easydrag"], function ($, helper) {
    //定义全局变量


    var $window = $(window),
        $document = $(document),
        $body = $(document.body);

    $(document).ready(function () {
        $window = $(window);
        $document = $(document);
        $body = $(document.body);
    });

    var gZIndex = 10000,
        overlayIndex = gZIndex,
        gId = 1000,
        gIE6 = (function () {
            if (helper.browser.msie && helper.browser.version == "6.0") {
                return true;
            }
            return false;
        })();

    var gOverlayerMgr = {
        exist: false,
        dialogs: [],
        getId: function () {
            return "dialog_overlayer";
        },
        getHtml: function () {
            var str = "<div id='" + this.getId() + "' class='popup-overlayer'></div>";
            return str;
        },
        create: function (dialog, config) {
            this.dialogs.push(dialog);

            if (this.exist){
                if (config.opacity!=undefined) {
                    this.el.css("opacity", config.opacity);
                }
                return;
            }
            this.el = $(this.getHtml());
            if (config.opacity!=undefined) {
                this.el.css("opacity", config.opacity);
            }
            if (gIE6) {
                this.hideSelect();
            }
            $body.append(this.el);

            this.setEvent();
            this.exist = true;
        },
        hideSelect: function () {
            this.hide_select = $("select:visible");
            this.hide_select.hide();
        },
        showSelect: function () {
            if (this.hide_select) {
                this.hide_select.show();
            }
        },
        open: function (config) {
            this.el.css({"zIndex":overlayIndex, height:$("html").height()});
            this.el.show();
            if (config && config.opacity != undefined) {
                this.el.css("opacity", config.opacity);
            }
        },
        close: function (dialog) {
            for (var i = 0; i < this.dialogs.length; i++) {
                if (this.dialogs[i].id == dialog.id) {
                    this.dialogs.splice(i, 1);
                    break;
                }
            }
            if (this.dialogs.length <= 0) {
                this.el.hide();
                if (gIE6) {
                    this.showSelect();
                }
            }
        },
        setEvent: function () {
            var _this = this;
            this.el.click(function () {
                var top_dialog = _this.dialogs[_this.dialogs.length - 1];
                if (top_dialog && top_dialog.overlayer && top_dialog.overlayer.config && top_dialog.overlayer.config.clickClose) {
                    top_dialog.close();
                }
            });

        }
    };

    //创建遮罩层类
    function Overlayer(dialog, config) {
        this.dialog = dialog;
        this.config = config;

        //先将html放入body，调用open方法才显示，不然ie里面会看到渲染过程。。。
        this.create();
    }

    Overlayer.prototype.create = function () {
        gOverlayerMgr.create(this.dialog, this.config);
    };
    Overlayer.prototype.open = function (config) {
        gOverlayerMgr.open(config);
    };
    Overlayer.prototype.close = function () {
        gOverlayerMgr.close(this.dialog);
    };


    //dialogMgr 用来管理相同group，group相同时需要关闭之前相同group的dialog。
    var gDialogMgr = {
        groups: {},
        add: function (group, dialog) {
            if (this.groups[group]) {
                this.groups[group].close();
            }
            this.groups[group] = dialog;
        },
        del: function (group, dialog_id) {
            if (this.groups[group] && this.groups[group].id == dialog_id) {
                delete this.groups[group];
            }
        }
    };
    //创建对话框类
    function Dialog(options) {
        gId++;
        gZIndex++;
        plugin.gZIndex = gZIndex;
        options = options || {};

        this.options = $.extend(true, {
            id: "dialog_" + gId,
            group: false,
            width: '',
            fixed: true,
            dialogClass: "",
            header: "",   //标题
            content: "",  //bd内容
            close:true,   //关闭按钮
            hide:false, // true->关闭的时候将隐藏$el, 否则删掉
            iframe: false, // ifreme url
            onClose: function () {
            },
            onYes:function(){},
            autoClose: false,
            overlayer:{
                clickClose: true,
                opacity: 0.4
            },
            template: {
                dialog_container: '<div class="popup" dialog-role="container"></div>',
                dialog_header: '<div class="hd" dialog-role="header"></div>',
                dialog_body: '<div class="bd" dialog-role="body"></div>',
                dialog_close: '<div class="close3Btn" dialog-role="close"></div>',

                dialog_iframe: "<iframe frameborder='0' marginheight='0' marginwidth='0' width='100%' scrolling='auto' style='background:#fff;border:none;'></iframe>"
            }
        }, options);

         this.create();
         this.bindEvents();

    }

    Dialog.prototype.setDrop = function ($el, $header) {
        var cur_index = gZIndex,
            _this = this;
        $el.beforeDrag(function(e){
            if($el.hasClass("fixed")){
                var top = $el.offset().top;
                $el.removeClass("fixed");
                $el.css("top",top);
            }
        });
        $el.ondrop(function(){
            $el.css("zIndex", cur_index);
            if (_this.options.fixed){
                var top = $el.offset().top,
                    scroll_top = $(document).scrollTop();
                $el.addClass("fixed");
                $el.css("top",top-scroll_top);
                $el.css("position","");
            }
        });
        $el.ondrag(function (e, el) {
            var pos = $el.position(),
                top = pos.top,
                left = pos.left,
                height = $el.height(),
                width = $el.width(),
                scroll_top = $(document).scrollTop(),
                $win = $(window),
                win_height = $win.height(),
                win_width = $win.width();

            if(top<=scroll_top){
                $el.css("top", scroll_top);
            }
            if(top - scroll_top >= win_height-height){
                $el.css("top", scroll_top+win_height-height);
            }
            if(left <= 0){
                $el.css("left", 0);
            }
            if(left+width>=win_width-3){
                $el.css("left", win_width - width-3);
            }
        });
        $el.easydrag();
        $el.setHandler($header);
    };

    Dialog.prototype.create = function () {
        var op = this.options,
            tpl =  op.template,
            $el = $(tpl.dialog_container);
        $el.css("zIndex", gZIndex);
        $el.attr("id", op.id);
        if(op.header){
            var $header =   $(tpl.dialog_header).html(op.header);
            $el.append($header);

            this.setDrop($el, $header);

        }
        if(op.content){
            $el.append($(tpl.dialog_body));
             $el.find("[dialog-role=body]").html(op.content);
        }
        if(op.close){
            $el.append(tpl.dialog_close);
        }
        if (op.width) {
            $el.css({width: op.width});
        }
        if(op.dialogClass){
            $el.addClass(op.dialogClass);
        }

        if (op.overlayer && !$.isEmptyObject(op.overlayer)) {
            this.overlayer = new Overlayer(this, op.overlayer);
        }
        $body.append($el);

        this.$el = $el;
    };

    Dialog.prototype.getEl = function () {
        return this.$el;
    };

    Dialog.prototype.setHeader = function (cp) {
        this.$el.find("[dialog-role=header]").text(cp);
    };

    Dialog.prototype.setContent = function (content) {
        this.$el.find("[dialog-role=body]").text(content);
        this.setPosition();
    };

    //弹出dialog
    Dialog.prototype.open = function () {
        var op = this.options;
        if (op.group) {
            gDialogMgr.add(op.group, this);
        }
        this.setHeight();
        this.setPosition();
        this.$el.hide();

        this.setAutoClose();
        if (this.overlayer) {
            this.overlayer.open(this.overlayer.config);
        }

        if(op.fade){
            //this.$el.fadeIn();
            this.$el.css({opacity:0}).show().animate({opacity:1});
            if(helper.browser.msie) this.$el[0].style.removeAttribute('filter');
        } else{
            var top = this.$el.css("top");
            this.$el.css("top", $(window).height());
            this.$el.show().focus();
            this.$el.animate({top:top}, 200);
        }



        $window.bind("resize", this, this.windowResize);
        this.closed = false;
    };

    //当content里面为iframe时 需要设置固定高度
    Dialog.prototype.setHeight = function () {
        if (this.options.iframe) {
            this.$el.find("iframe").height(this.options.height).width(this.options.width);
            this.$el.css("width", "auto");
            //this.el.height(parseInt(this.height));
        }
    };

    //定时关闭dialog
    Dialog.prototype.setAutoClose = function () {
        if (this.options.autoClose) {
            var _this = this;
            this.closeTimer = setTimeout(function () {
                _this.close();
            }, this.options.autoClose);
        }
    };

    Dialog.prototype.setWidth = function (w) {
        this.$el.css({width: w + "px"});
    };

    Dialog.prototype.windowResize = function (event) {
        event.data.setPosition();
    };

    //设置dialog的位置
    Dialog.prototype.setPosition = function () {
        var _left = ($window.width() - this.$el.outerWidth()) / 2;
        var _top = ($window.height() - this.$el.outerHeight()) / 2;
        _left = _left > 20 ? _left : 20;
        _top = _top > 20 ? _top : 20;
        var obj = {};
        if (this.options.fixed) {
            obj.left = _left;
            if (!gIE6) {
                obj.top = _top;
            }
            this.$el.addClass("fixed");

        } else {
            obj = {
                left: $document.scrollLeft() + _left,
                top: $document.scrollTop() + _top
            };
            this.$el.removeClass("fixed");
        }
        this.$el.stop().css(obj);
    };


    Dialog.prototype.bindEvents = function () {
        var _this = this;
        this.$el.on("click", "[dialog-role=close]", function(){
            _this.close();
            return false;
        });

        this.$el.on("click", "[dialog-role=yes]", function(){
            _this.yesFn();
            return false;

        });
        this.$el.on("click", "[dialog-role=cancel]", function(){
            _this.close();
            _this.cancelFn();
            return false;
        });

    };

    Dialog.prototype.cancelFn = function(){
        var op = this.options;
        if (op.onCancel && $.isFunction(op.onCancel)) {
            op.onCancel.call(this);
        }
    };

    Dialog.prototype.yesFn = function () {
        var op = this.options,
            _this = this;
        if (op.onYes && $.isFunction(op.onYes)) {
            if(op.onYes.call(this) !== false){
                _this.close();
            }
        }
    };

    Dialog.prototype.unbindEvents = function () {
        $window.unbind("resize", this.windowResize);
        this.$el.off();
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    };


    Dialog.prototype.close = function () {
        if (this.closed) return;
        var op = this.options,
            _this = this;
        if (op.onClose && $.isFunction(op.onClose)) {
            op.onClose.call(this);
        }

        if (op.group) {
            gDialogMgr.del(op.group, op.id);
        }

        if (this.overlayer) {
            this.overlayer.close();
        }
        this.closed = true;
        if(op.hide){
            if(op.fade){
                this.$el.animate({opacity:0},function(){
                    _this.$el.hide();
                });
            }else{
                var h =   $(window).height();
                this.$el.animate({top:h}, 200, "swing", function(){
                    _this.$el.hide();
                });
            }
        }else{
            this.unbindEvents();
            if(op.fade){
                this.$el.animate({opacity:0},function(){
                    _this.$el.remove();
                });
            }else{

                this.$el.animate({top: $(window).height()}, 200, function(){
                    _this.$el.remove();
                });
            }

        }
    };

    var plugin = {};
    plugin.Dialog = Dialog;

    plugin.success = function (text, option) {
        var op = $.extend({
            content:text || "操作成功",
            dialogClass: "msg2",
            close:false,
            autoClose: 1000,
            fade:true,
            overlayer: {
                opacity: 0
            },
            template:{
                dialog_container:'<div class="msg2" dialog-role="container"></div>',
                dialog_body:"<span dialog-role='body'></span>"
            }
        }, option);
        var dialog = new Dialog(op);
        dialog.open();
    };

    plugin.warn = function (text, option) {
        plugin.alert(text, option);
        return;
        var op = $.extend({
            content: '<div class="warp"><span>' + (text || '操作失败') + '</span></div>',
            dialogClass: "msgTip warn",
            close:false,
            autoClose: 1000,
            overlayer: {
                opacity: 0
            }
        }, option);
        var dialog = new Dialog(op);
        dialog.open();
    };

    plugin.alert = function (text, option) {
        var content = '<div class="msg_title">' + (text || "") +'</div>' +
            ' <div class="operate"><a href="javascript:;" class="confirmBtn" dialog-role="yes">确认</a></div>';
        var op = $.extend({
            content: content,
            close:false,
            dialogClass: "msg msg_alert",
            overlayer: {
                clickClose: false
            },
            onYes:function(){
                this.close();
            }
        }, option);
        var dialog = new Dialog(op);
        dialog.open();
        var el = dialog.getEl();
        el.focus();

        var enter_close = function (event) {
            if (event.keyCode == 13) {
                $(document).off("keypress", enter_close);
                dialog.close();
                return false;
            }
        };
        $(document).on("keypress", enter_close);
    };

    plugin.confirm = function (text, callback, option) {
        callback = callback || $.noop;
        option = option || {};
        var content = '<div class="msg_title">'+(text || "您确定要这样做么？")+'</div>' +
            '<div class="operate">' +
            '<a href="javascript:;" class="confirmBtn" dialog-role="yes">'+(option.yesText || "确定")+'</a>' +
            '<a href="javascript:;" class="cancelBtn" dialog-role="cancel">'+(option.cancelText || "取消")+'</a></div>';
        if(option.checkbox){
            content += '<div class="msg_noprompt"><input type="checkbox"><label>'+option.checkbox+'</label></div>';
        }
        var op = $.extend({
            content: content,
            dialogClass: "msg msg_confirm",
            close:false,
            overlayer: {
                clickClose: false
            },
            callback: $.noop,
            onYes:function(){
                var checked = false;
                if(option.checkbox){
                    checked = !!$el.find("input[type=checkbox]")[0].checked;
                }
                callback(checked);
                op.callback(checked);
            },
            onCancel:function(){

            }
        }, option);
        var dialog = new Dialog(op),
            $el = dialog.getEl();
        dialog.open();

    };
    return plugin;
});