
define([
    'jquery',
    'underscore',
    'backbone'],
function ($, _, Backbone) {
    var titleViewTemplate = '<a href="javascript:;" class="combobox_group group"><em><%= text %></em><span class="arrow_btm"></span></a><p class="cl"></p>';
    var TitleView = Backbone.View.extend({
        template: _.template(titleViewTemplate),
        className: "",
        events: {
            "click": "doChangeStatus"
        },
        doChangeStatus: function () {
            var $span = this.$("span");
            var isShow = false;

            if ($span.is(".arrow_btm")) {
                $span.attr("class", "arrow_top");
                isShow = true;
            } else {
                $span.attr("class", "arrow_btm");
            }

            this.model.get("onChangeStatus").call(this, isShow);

            return false;
        },
        $a: function () {
            return this.$("a");
        },
        doChangeTitle: function (str) {
            this.model.set("text", str);
            this.$("em").text(str);
            this.$("a").attr("title", str);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this.$el;
        }
    });

    return TitleView;
});