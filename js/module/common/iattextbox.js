define([
'jquery',
'underscore',
'backbone',
'json2',
'model/search',
'module/common/userview',
'plugin/jquery.attextbox'],
function ($, _, Backbone, JSON, SearchModel, UserView) {
    var template = [
		'	<div class="selectItem">',
		'		<p class="tit">选择需要@的人或直接输入</p>',
        '   <div class="container"></div>    ',
		'	</div>',
    ].join('');
    var iAttextbox = Backbone.View.extend({
        isChange: true,
        className: "dropList",
        template: _.template(template),
        list: null,
        index: 0,
        initialize: function () {
            this.list = new Backbone.Collection();
            this.model.on("change:keywords", this.ChangeKeyword, this);
            this.render();
        },
        ChangeKeyword: function () {
            this.isChange = true;
        },
        bind: function ($el, options) {
            var _this = this;

            $el.attextbox($.extend(options, {
                onKeyClick: function (keycode) {
                    var n = _this.data.length;

                    if (n) {
                        switch (keycode) {
                            case 13: //enter
                                _this.list.models[_this.index].set("click", true);
                                break;
                            case 40: // up
                                _this.list.models[_this.index].set("checked", false);
                                if (_this.index >= _this.data.length - 1) _this.index = 0;
                                else _this.index++;
                                _this.list.models[_this.index].set("checked", true);
                                break;
                            case 38: //down
                                _this.list.models[_this.index].set("checked", false);
                                if (_this.index == 0) _this.index = _this.data.length - 1;
                                else _this.index--;
                                _this.list.models[_this.index].set("checked", true);
                                break;
                        }
                    }
                    return false;
                },
                onCallData: function ($panel, filter, callback) {
                    _this.isChange = false;
                    _this.model.set("keywords", filter);
                    if (filter) {
                        _this.$(".tit").text("选择昵称或轻敲空格完成输入");
                    } else {
                        _this.$(".tit").text("选择需要@的人或直接输入");
                    }
                    if (_this.isChange) {
                        _this.model.doSearchUsers(function (data) {
                            //var n = 0;
                            data = data.split(',');
                            _this.data = data;
                            _this.doDealData($panel);
                            callback(_this.data.length);
                        }, function (data) {

                        });
                    } else {
                        if (_this.data) {
                            _this.doDealData($panel);
                            callback(_this.data.length);
                        }
                    }
                }
            }));
        },
        doDealData: function ($panel) {
            if (!this.data) return;
            var n = this.data.length;
            if (n) {
                this.$(".container").empty();
                this.list.reset();
                for (var i = 0; i < n; i++) {
                    var model = new SearchModel({ title: this.data[i], checked: (i == 0), click: false });
                    var view = new UserView({ model: model });
                    this.list.add(model);
                    this.$(".selectItem .container").append(view.render());
                }
                this.index = 0;
                $panel.empty().append(this.$el).show();
            }
        },
        render: function () {
            this.$el.html(this.template());
        },
        release: function () {
            $.attextbox("destroy", true);
        }
    });

    return new iAttextbox({
        model: new SearchModel()
    });
});