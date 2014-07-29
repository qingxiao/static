define([
'jquery',
'underscore',
'backbone',
'module/common/ifollow',
'plugin/jquery.parser'
],
function ($, _, Backbone, iFollow) {
    var template = [
    	'<div class="leftShow">',
        '    <div class="popUserPanel left">',
        '       <div class="userfacebase"> ',
        '            <div class="userbaseface<%=width%>"><img src="<%=src%>" alt="" /></div>',
    //        '            <div class="text">',
    //        '               <a class="followBtn_mini" href="javascript:;">',
    //        '                   <span class="default">关注</span>',
    //        '                   <span class="hover">取消</span>',
    //        '               </a>',
    //        '           </div>',
        '            <i class="light">&nbsp;</i>',
		'		</div>',
        '    </div>',
        '    <div class="popUserPanel right">',
        '        <span class="intro title "><%=nickname%><span class="VIcon ">&nbsp;</span></span>',
        '        <span class="intro "><%=personDescribe?personDescribe:"无定位"%></span>',
        '    </div>',
        '</div>'].join('');
    var timeid = 0;
    var PicModel = Backbone.Model.extend({
        defaults: {
            nickname: "dagaegaeg",
            personDescribe: "aegaeg",
            src: "",
            href: "",
            uid: 0,
            is_follow: false,
            be_followed: false
        }
    });
    var PicShow = Backbone.View.extend({
        template: _.template(template),
        tagName: "div",
        className: "bud-4",
        events: {
            "mouseenter .userfacebase": "doShowLight",
            "click": "doDirect"
        },
        doDirect: function () {
            location.href = this.model.get("href");
        },
        doShowLight: function () {
            var _this = this, $i = _this.$el.find("i");

            $i.animate({
                left: _this.model.get("width") / 2 * 3 + 10
            }, 400, function () {
                $i.css("left", (_this.model.get("width") / 2 * 3 * -1 + 10) + "px");
            });
        },
        init: function (imgWidth, classWidth) {
            var _this = this;

            $(".picCon,.userFaceList .listItem .userbaseface60").on({
                mouseenter: function () {
                    var $this = $(this), $img = $this.find("img").clone(), data_options = $.extend({}, $.parser.parseOptions(this, [
                    {
                        nickname: "string",
                        personDescribe: "string",
                        href: "string"
                    }]));

                    clearTimeout(timeid);
                    timeid = setTimeout(function () {
                        data_options.src = $img.attr("src");
                        data_options.width = classWidth;
                        _this.model.set(data_options);
                        _this.show();
                        $this.append(_this.$el.show());
                        var $userPanel = _this.$el.find(".popUserPanel:eq(1)"), $userPanel0 = _this.$el.find(".popUserPanel:eq(0)"), width = $userPanel.width();
                        if (data_options.position == "right") {
                            $userPanel0.removeAttr("style").css({
                                "left": "auto",
                                "right": imgWidth
                            });
                            _this.$el.removeAttr("style").css({
                                "left": "auto",
                                "right": -1
                            });
                            $userPanel.stop().css("width", width).animate({
                                "width": width + (imgWidth + 1)
                            }, 150, function () {
                                _this.$el.css("z-index", 9999);
                            });
                        } else {
                            $userPanel0.removeAttr("style").css({
                                "left": 0,
                                "right": "auto"
                            });
                            _this.$el.removeAttr("style").css({
                                "left": 0,
                                "right": "auto"
                            });
                            $userPanel.stop().css("width", width).animate({
                                "margin-left": (imgWidth + 1 + 2)
                            }, 150, function () {
                                _this.$el.css("z-index",9999);
                            });
                        }
                    }, 200);
                    return false;
                },
                mouseleave: function () {
                    //var $this = $(this);

                    clearTimeout(timeid);
                    timeid = setTimeout(function () {
                        _this.$el.hide();
                    }, 200);
                }
            });
        },
        show: function () {
            this.render();
            this.undelegateEvents();
            this.delegateEvents(this.events);
        },
        render: function (index) {
            var _this = this;

            _this.$el.html(_this.template(this.model.toJSON())).css({
                "width": "auto"
            });
            return _this.$el;
        },
        release: function () { }
    });

    return new PicShow({
        model: new PicModel()
    });
});