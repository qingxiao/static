
define([
    'jquery',
    'underscore',
    'backbone',
    'model/feed_group',
    'collection/feed_group'],
function ($, _, Backbone, feedGroupModel, feedGroups) {
    var feedGroup = Backbone.View.extend({
        groups: null,
        initialize: function () {
            //this.getGroups();
        },
        /// <summary>
        ///	取得feed分组信息
        /// </summary>
        getGroups: function () {
            var _this = this;
            if (!this.model.get("isLoad")) {
                if (!this.model.get("isLoadings")) {
                    this.groups = new feedGroups();
                    this.groups.on("reset", this.loadGroups, this);
                    this.groups.fetch({
                        success: function () {
                            _this.loadGroups();
                        }
                    });
                    this.model.set("isLoadings", true);
                }
            } else {
                this.loadGroups();
            }
        },
        onLoad: function (key, func, pointer) {
            this.model.get("onLoadEvent")[key] = {
                func: func,
                pointer: pointer
            };
        },
        onRemoveLoad: function (key) {
            this.model.get("onLoadEvent")[key] = null;
            delete this.model.get("onLoadEvent")[key];
        },
        doAdd: function (model) {
            var _this = this;

            //model.set("title", encodeURIComponent( model.get("title")));
            _this.groups.add(model);
            _this.callAdd(model, "add");
        },
        doRemove: function (model) {
            this.groups.remove(model);
            this.callAdd(model, "remove");
        },
        doEdit: function (model) {
            var mdl = this.groups._byId[model.get("id")];

            if (mdl) {
                this.callAdd(mdl, "edit");
            }
        },
        callAdd: function (model, type) {
            var _this = this;

            for (var key in _this.model.get("onAddEvent")) {
                var data = _this.model.get("onAddEvent")[key];

                data.func.call(data.pointer, model, type);
            }
        },
        callLoad: function () {
            var _this = this;

            for (var key in _this.model.get("onLoadEvent")) {
                var data = _this.model.get("onLoadEvent")[key];

                data.func.call(data.pointer, _this.groups);
            }
        },
        onAdd: function (key, func, pointer) {
            this.model.get("onAddEvent")[key] = {
                func: func,
                pointer: pointer
            };
        },
        onRemoveAdd: function (key) {
            this.model.get("onAddEvent")[key] = null;
            delete this.model.get("onAddEvent")[key];
        },
        /// <summary>
        ///	feed分组信息回调
        /// </summary>
        loadGroups: function () {
            this.model.set("isLoad", true);
            this.callLoad();
        }
    });

    return new feedGroup({
        model: new Backbone.Model({
            isLoad: false,
            isLoadings: false,
            onAddEvent: {},
            onLoadEvent: {},
            onLoad: function () { }
        })
    });
});