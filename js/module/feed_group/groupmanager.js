define([
'jquery',
'underscore',
'backbone',
'module/feed_group/groupview',
'model/feed_group',
'module/feed_group/group',
"plugin/dialog"],
function ($, _, Backbone, GroupView, feedGroupModel, feedGroupModule, dialog) {
    var template = [
	'		<div class="grouping_title">',
	'			<div class="fl">组名</div>',
	'			<div class="fr"><a href="javascript:;">为什么要设置分组</a>',
    '           <div class="grouphelp_txt">',
	'				将关注的账号加入分组，可以帮助你更有效率地浏览关注的声音流和新鲜事。',
	'				<span class="arrow_group"><i></i></span>',
	'			</div>',
    '           </div>',
	'		</div>',
	'		<ul class="grouping_list">',
	'		</ul>',
	'		<div class="grouping_btm ">',
	'			<a class="addgroup">+&nbsp;添加组名</a>',
	'			<div class="addgroupdtl">',
	'				<input type="text" maxlength="8">',
	'				<div class="addgroupdtl_r">',
	'					<a href="javascript:;" class="saveBtn">保存</a>',
	'					<a href="javascript:;" class="removeBtn">取消</a>',
	'				</div>',
	'			</div>',
	'		</div>'
	].join('');

    var groupManagerView = Backbone.View.extend({
        template: _.template(template),
        events: {
            "click .addgroup": "doAddGroup",
            "click .removeBtn": "doAddGroup",
            "click .saveBtn": "doSaveGroup",
            "click .close3Btn": "doClose"
        },
        initialize: function () {
            this.render();
        },
        doClose: function () {
            this.$el.remove();
        },
        doAddGroup: function (e) {
            var $el = $(e.currentTarget);

            $el.closest(".grouping_btm").toggleClass("is-group-expand");
        },
        doSaveGroup: function (e) {
            //var $el = $(e.currentTarget);
            var $input = $(".addgroupdtl input");
            var val = $input.val();
            var _this = this;
            var model;

            if (val) {
                model = new feedGroupModel({
                    title: val
                });
                model.createGroup(function (model, data) {
                    feedGroupModule.doAdd(model);
                    _this.doAddGroup(e);
                    $input.val('');
                }, function (model, data) {
                    dialog.alert(data["msg"]);
                });
            }
        },
        render: function () {
            var _this = this;

            _this.$el.html(_this.template());
            feedGroupModule.onLoad("groupmanager", function (fGroups) {
                _this.$el.find("ul").empty();
                fGroups.each(_this.doAddGroupView, _this);
            }, _this);
            feedGroupModule.onAdd("groupmanager", function (model, type) {
                if (type == "add") {
                    _this.doAddGroupView.call(_this, model);
                }
            }, _this);

            //$("#mainbox").append(_this.$el);
            _this.undelegateEvents();
            _this.delegateEvents(_this.events);
        },
        doAddGroupView: function (model) {
            this.$el.find("ul").append(new GroupView({ model: model }).render());
        },
        show: function () {
            var _this = this, op = $.extend({
                id: "dialog_grouping",
                dialogClass: "grouping",
                header: "管理分组",
                content: _this.$el
            }, {});
            var pop = new dialog.Dialog(op);
            pop.open();
            feedGroupModule.getGroups();
            _this.undelegateEvents();
            _this.delegateEvents(_this.events);
        }
    });

    return new groupManagerView({

    });
});