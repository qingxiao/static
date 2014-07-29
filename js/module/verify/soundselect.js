define([
'jquery',
'underscore',
'backbone',
'module/verify/sound',
"plugin/dialog"],
function ($, _, Backbone, SoundView, dialog) {
    var template = [
			'<strong>声音列表</strong>',
			'<ul class="addTo">',
			'</ul>',
			'<div class="operate"><a class="confirmBtn" dialog-role="yes">确认</a><a class="cancelBtn" dialog-role="close">取消</a></div>'
    ].join('');
    var SoundListView = Backbone.View.extend({
        template: _.template(template),
        initialize: function () {
            this.render();
        },
        render: function () {
            var _this = this;

            _this.$el.html(_this.template());
        },
        doAddGroupView: function (model) {
            var soundView = new SoundView({ model: new Backbone.Model(model.get("track_record")) });

            model.set("checked", this.model.get("track_id") == model.get("track_id"));
            soundView.view = this.model;
            this.$el.find("ul.addTo").append(soundView.render());
        },
        show: function (options, datas) {
            var _this = this, op = $.extend({
                id: "dialog_addSound",
                dialogClass: "addSound",
                header: "选择声音",
                width: 450,
                content: _this.$el,
                onYes: function () {
                    $("#track_id").val(_this.model.get("track_id")).blur();
                    $("#track_title").text(_this.model.get("track_title"));
                }
            }, {});
            var pop = new dialog.Dialog(op);
            pop.open();
            pop.getEl().height("auto");
            this.$el.find("ul.addTo").empty();
            var collection = new Backbone.Collection(datas);
            collection.each(this.doAddGroupView, this);
        }
    });

    return new SoundListView({
        model: new Backbone.Model()
    });
});