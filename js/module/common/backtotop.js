define([
'jquery',
'underscore',
'backbone'],
function ($, _, Backbone) {
    var temp = [
        '<a href="javascript:void(0);"></a>',
    ].join('');
    var iBackToTop = Backbone.View.extend({
        template: _.template(temp),
        className: "backToTop",
        events: {
            "click": "toTop"
        },
        initialize: function () {
            var _this = this;
            _this.render();

            $(window).on("scroll", [_this], _this.backToTop);
        },
        toTop: function () {
            helper.scrollTo1(0, 0);
            this.$el.hide();
        },
        backToTop: function (e) {
            var _this = e.data[0], backtotoptimeout = 0;

            clearTimeout(_this.model.get("backtotoptimeout"));
            backtotoptimeout = setTimeout(function () {
                var st = $(document).scrollTop();
                if (st > 500) {
                    if (!_this.model.get("isShow")) {
                        _this.$el.show();
                        _this.model.set("isShow", true);
                    }
                }
                else {
                    if (_this.model.get("isShow")) {
                        _this.$el.hide();
                        _this.model.set("isShow", false);
                    }
                }
            }, 500);
            _this.model.set("backtotoptimeout", backtotoptimeout);
        },
        render: function () {
            this.$el.append(this.template());
            $(document.body).append(this.$el);
        }
    });

    return new iBackToTop({
        model: new Backbone.Model({
            backtotoptimeout: 50,
            isShow: false
        })
    });
});