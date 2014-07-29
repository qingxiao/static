define([
'jquery',
'underscore',
'backbone',
'json2',
'model/search',
'module/common/userview'],
function ($, _, Backbone, JSON, SearchModel, UserView) {
    var template = [
		'	<div class="selectItem">',
    //		'		<p class="tit">选择需要@的人或直接输入</p>',
        '   <div class="container"></div>    ',
		'	</div>',
    ].join('');
    var iAttextbox = Backbone.View.extend({
        isChange: true,
        index: 0,
        className: "dropList",
        list: new Backbone.Collection(),
        template: _.template(template),
        initialize: function () {
            this.model.on("change:keywords", this.ChangeKeyword, this);
            this.render();
        },
        ChangeKeyword: function () {
            this.isChange = true;
        },
        doChangeIndex: function (keycode, $el) {
            var _this = this;
            var n = _this.data.length;

            if (n) {
                switch (keycode) {
                    case 13: //enter
                        $el.val(_this.list.models[_this.index].get("title"));
                        $el.trigger("blur");
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
        bind: function ($el) {
            var _this = this;
            var filter = $el.val();

            _this.isChange = false;
            _this.model.set("keywords", filter);
            if (_this.isChange) {
                _this.model.doSearchUsers(function (data) {
                    //var n = 0;
                    if (data && data != " ") {
                        data = data.split(',');
                    } else {
                        data = [];
                    }
                    _this.data = data;
                    _this.doDealData($el);
                }, function (data) {

                });
            } else {
                if (_this.data) {
                    _this.doDealData($el);
                }
            }
        },
        doDealData: function ($panel) {
            if (!this.data) return;
            var n = this.data.length;

            this.list.reset();
            if (n) {
                this.$(".container").empty();
                for (var i = 0; i < n; i++) {
                    var model = new SearchModel({ title: this.data[i], checked: (i == 0), input: $panel });
                    var view = new UserView({ model: model });
                    this.list.add(model);
                    this.$(".selectItem .container").append(view.render());
                }
                this.index = 0;
            } else {
                this.$(".selectItem .container").html("没有匹配的用户");
            }
            $panel.after(this.$el.show());

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