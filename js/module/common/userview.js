define([
'jquery',
'underscore',
'backbone'
],
function ($, _, Backbone) {
    var template = [
		'<a class="attextbox_data" href="javascript:void(0);">',
		'	<span><%=title%></span>',
		'</a>'
        ].join('');
    var UserView = Backbone.View.extend({
        template: _.template(template),
        tagName: "dl",
        className: "clearfix_after attextbox_data1",
        events: {
            "click": "doClick"
        },
        doClick: function () {
            if (this.model.get("input")) {
                this.model.get("input").val(this.model.get("title"));
            }
        },
        initialize: function () {
            this.model.on("change:checked", function () {
                this.render();
            }, this);
            this.model.on("change:click", function () {
                this.$el.click();
            }, this);
        },
        render: function (index) {
            var _this = this;

            _this.$el.attr("idx", index).html(_this.template(_this.model.toJSON()));
            if (this.model.get("checked")) {
                _this.$el.addClass("dropListselect");
            } else {
                _this.$el.removeClass("dropListselect");
            }

            return _this.$el;
        }
    });

    return UserView;
});