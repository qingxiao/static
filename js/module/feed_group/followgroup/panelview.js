
define([
    'jquery',
    'underscore',
    'backbone',
    'model/feed_group',
    'module/feed_group/followgroup/paneldataview'],
function ($, _, Backbone, FeedGroupModel, PanelDataView) {
    var panelViewTemplate = [
        '<ul></ul>',
        '<div class="groupcreate">',
        '<a href="javascript:;" class="group_add">+创建新分组</a>',
        '<div class="edit">',
        '<input type="text" class="text" maxlength="8" />',
        '<div><a class="editConfirm">确认</a><a class="cancel">取消</a></div>',
        '</div></div>'].join('');
    var PanelView = Backbone.View.extend({
        template: _.template(panelViewTemplate),
        className: "dropdowngroup",
        titleView: null,
        $jq: null,
        timeOutID: 0,
        list: null,
        events: {
            "click .group_add": "doShowNew",
            "click .cancel": "doShowNew",
            "click .editConfirm": "doSaveNew"
        },
        doShowNew: function (e) {
            var $el = $(e.currentTarget);

            $el.closest(".groupcreate").toggleClass("is-group-create");

            return false;
        },
        doSaveNew: function (e) {
            var _this = this;
            //var $el = $(e.currentTarget);
            var val = _this.$("input.text").val();

            if (val) {
                _this.model.get("onSaveNew").call(_this.$jq, val, function (model) {
                    _this.$("input.text").val('');
                    _this.doAddOne(_this, model, []);
                    _this.doShowNew(e);
                });
            }
            return false;
        },
        doSaveGroups: function ($a) {
            var ids = [], _this = this;
            var isautopush = false;
            if (_this.model.get("changed") === true) {
                _this.list.each(function (model) {
                    if (model.get("id") == -1) {
                        isautopush = true;
                    }
                    ids.push(model.get("id") + "");
                }, _this);
                var options = _this.$jq.combobox("options");
                _this.model.get("onChangeGroups").call(_this.$jq, ids, isautopush, options.uid, function () {
                    _this.model.set("changed", false);
                    $a.click();
                });
            } else {
                $a.click();
            }
        },
        render: function () {
            var _this = this;

            _this.list = new Backbone.Collection();
            _this.$el.html(_this.template(_this.model.toJSON()));
            _this.titleView.model.set("onChangeStatus", function (isShow) {
                if (isShow) {
                    var $a = _this.titleView.$a();
                    if (_this.model.get("onBeforeShowGroups").call(_this.$jq) == false) {
                        $a.click();
                        return;
                    }
                    _this.$el.show();
                    $a.off().on({
                        focus: function () {
                            clearTimeout(_this.timeOutID);
                        },
                        blur: function () {
                            _this.timeOutID = setTimeout(function () {
                                _this.doSaveGroups($a);
                            }, 300);
                        }
                    }).focus();
                    _this.$el.off("mouseenter").off("mouseleave").off("mouseout").off("mouseover").on({
                        mouseenter: function () {
                            clearTimeout(_this.timeOutID);
                            $a.blur();
                            clearTimeout(_this.timeOutID);
                        },
                        mouseover: function () {
                            clearTimeout(_this.timeOutID);
                            $a.blur();
                            clearTimeout(_this.timeOutID);
                        },
                        mouseout: function () {
                            //clearTimeout(_this.timeOutID);
                            //$a.focus();
                        },
                        mouseleave: function () {
                            clearTimeout(_this.timeOutID);
                            $a.focus();
                        }
                    });
                } else {
                    clearTimeout(_this.timeOutID);
                    _this.$el.hide();
                }
            });
            _this.$el.hide();
            _this.$el.css("right", 7);
            return _this.$el;
        },
        doChangeStatus: function (model) {
            var str = "";

            if (model) {
                this.model.set("changed", true);
                if (model.get("checked")) {
                    this.list.add(model);
                } else {
                    this.list.remove(model);
                }
            }
            var isOver = false;
            this.list.each(function (mdl, index) {
                if (!isOver) {
                    if (!str) {
                        str += mdl.get("title");
                    } else {
                        if (str.length + mdl.get("title").length <= 7) {
                            str += "," + mdl.get("title");
                        } else {
                            str += "...";
                            isOver = true;
                            return false;
                        }
                    }
                }
            }, this);
            if (!str) { str = "未分组"; }
            this.titleView.doChangeTitle(str);
        },
        doInitData: function (datas, ids) {
            var _this = this,  model;

            _this.$("ul").empty();
            _.each(datas, function (data, idx) {
                data.checked = false;
                model = new FeedGroupModel(data);
                _this.doAddOne(_this, model, ids);
            });
            //            for (var key in datas) {
            //                data = datas[key];
            //                data.checked = false;
            //                model = new FeedGroupModel(data);
            //                _this.doAddOne(_this, model, ids);
            //            }
            this.doChangeStatus();
        },
        doAddOne: function (_this, model, ids) {
            model.set("onCheckChange", function (model) { _this.doChangeStatus(model); });
            model.set("checked", jQuery.inArray(model.get("id") + "", ids) >= 0);
            view = new PanelDataView({ model: model });
            if (model.get("checked")) {
                _this.list.add(model);
            }
            _this.$("ul").append(view.render());
        }
    });

    return PanelView;
});