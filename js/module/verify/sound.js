define([
'jquery',
'underscore',
'backbone'],
function ($, _, Backbone) {
    var template = [
         '<span><%=title%></span><a class="selItemBtn"></a><a class="selItemBtn2"></a>'
     ].join('');
    var soundView = Backbone.View.extend({
        template: _.template(template),
        tagName: "li",
        events: {
            "click": "doSelect"
        },
        doSelect: function (e) {
            this.view.set("track_id", this.model.get("track_id"));
            this.view.set("track_title", this.model.get("title"));
            $(".addTo li.on").removeClass("on");
            this.$el.addClass("on");
        },
        render: function () {
            var _this = this;

            _this.$el.html(_this.template(_this.model.toJSON()));
            this.undelegateEvents();
            this.delegateEvents(this.events);
            if (this.model.get("checked")) {
                _this.$el.addClass("on");
            }

            return _this.$el;
        }
    });

    return soundView;
});