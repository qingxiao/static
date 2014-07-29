define([
'jquery',
'underscore',
'backbone',
'model/feed_group',
'module/feed_group/group',
'plugin/dialog'],
function ($, _, Backbone, feedGroupModel, feedGroupModule, dialog) {
    var template = [
        '<div class="fl"><span><%=title%></span><input maxlength="8" style="display:none;" type="text" value="<%=title%>"></div>',
        '<div class="fr"><a class="edit">编辑</a><a class="delete">删除</a><a class="save">保存</a><a class="cancel">取消</a></div></li>'].join('');
    var groupView = Backbone.View.extend({
        template: _.template(template),
        tagName: "li",
        events: {
            "click .edit": "doEdit",
            "click .delete": "doDelete",
            "click .save": "doSave",
            "click .cancel": "doCancelEdit"
        },
        doSave: function (e) {
            var _this = this;
            var $input = _this.$(".fl input");
            var val = $input.val();

            if (val) {
                _this.model.set("title", val);
                if (!_this.model.changed["title"]) {
                    _this.doCancelEdit();
                }
            } else {
                dialog.alert("组名不能为空！");
            }
        },
        doCancelEdit: function (e) {
            var _this = this;

            _this.$(".fl span").show();
            _this.$(".fl input").hide();
            _this.$el.removeClass("is-edit");
            _this.model.off("change:title");
            _this.model.set("title", _this.model.get("title1"));
            _this.render();
        },
        doEdit: function (e) {
            var _this = this;

            _this.$(".fl span").hide();
            _this.$(".fl input").show();
            _this.$el.addClass("is-edit");
            _this.model.set("title1", _this.model.get("title"));
            _this.model.on("change:title", this.doChangeTitle, this);
        },
        doDelete: function (e) {
            var _this = this;

            _this.model.deleteGroup(function (model, data) {
                feedGroupModule.doRemove(_this.model);
                feedGroupModule.groups.remove(_this.model);
                _this.remove();
            }, function (model, data) {
                dialog.alert(data["msg"]);
            });
        },
        doChangeTitle: function () {
            var _this = this;

            if (_this.model.get("title")) {
                _this.model.editGroup(function (model, data) {
                    _this.render();
                    _this.model.set("title1", model.get("title"));
                    feedGroupModule.doEdit(model);
                    _this.doCancelEdit();
                }, function (model, data) {
                    dialog.alert(data["msg"]);
                    _this.model.set({ "title": "" }, { slient: true });
                });
            }
        },
        initialize: function () {
            //this.model.off("change");
            //this.model.on("change:title", this.doChangeTitle, this);
        },
        render: function () {
            var _this = this;

            _this.$el.html(_this.template(_this.model.toJSON()));
            this.undelegateEvents();
            this.delegateEvents(this.events);

            return _this.$el;
        }
    });

    return groupView;
});