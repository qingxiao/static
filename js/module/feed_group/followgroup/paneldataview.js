
define([
    'jquery',
    'underscore',
    'backbone'],
function ($, _, Backbone) {
    var panelDataViewTemplate = '<label><input type="checkbox" <% if(checked){ %>checked <%}%>/>&nbsp;<%=title%></label>';
    var PanelDataView = Backbone.View.extend({
        template: _.template(panelDataViewTemplate),
        tagName: "li",
        events: {
            "click": "doClick"
        },
        doClick: function () {
            var checked = this.$("input").is(":checked");

            this.model.set("checked", checked);
        },
        initialize: function () {
            this.model.on("change:checked", this.doChangeStatus, this);
        },
        doChangeStatus: function () {
            this.model.get("onCheckChange").call(this, this.model);
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this.$el;
        }
    });

    return PanelDataView;
});