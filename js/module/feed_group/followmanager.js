define([
'jquery',
'underscore',
'backbone',
'module/feed_group/groupview1',
'module/feed_group/group',
'model/feed_group',
"plugin/dialog"],
function ($, _, Backbone, GroupView, feedGroupModule, feedGroupModel, dialog) {
    var template = [
		'	<div class="grouping_title">',
		'		<div class="fl">为<span></span>设置分组</div>',
		'		<div class="fr"><a>为什么要设置分组</a>',
        '           <div class="grouphelp_txt">',
	    '				将关注的账号加入分组，可以帮助你更有效率地浏览关注的声音流和新鲜事。',
	    '				<span class="arrow_group"><i></i></span>',
	    '			</div>',
        '       </div>',
		'	</div>',
		'	<ul class="grouping_list">',
		'		<li>',
		'		</li>',
        '		<li><span>',
		'				<div class="groupcreate">', //is-group-create
		'					<a href="javascript:;" class="group_add">+创建新分组</a>',
		'					<div class="edit"><input type="text" maxlength="8"  /><a class="editConfirm">确认</a><a class="cancel">取消</a></div>',
		'				</div>',
		'			</span></li>',
		'	</ul>',
		'	<div class="grouping_btm">',
		'		<div class="addgroupdtl">',
		'			<div class="addgroupdtl_r">',
		'				<a href="javascript:;" class="saveBtn" dialog-role="yes">保存</a>',
		'				<a href="javascript:;" class="removeBtn" dialog-role="close">取消</a>',
		'			</div>',
		'		</div>',
		'	</div>'
    ].join('');
    var FollowManagerView = Backbone.View.extend({
        template: _.template(template),
        events: {
            "click .group_add": "doAddGroup",
            "click .cancel": "doAddGroup",
            "click .editConfirm": "doSaveGroup"
        },
        groups: [],
        doAddGroup: function (e) {
            var $el = $(e.currentTarget);

            $el.closest(".groupcreate").toggleClass("is-group-create");
        },
        doSaveGroup: function (e) {
            //var $el = $(e.currentTarget);
            var $input = this.$(".groupcreate input");
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
        initialize: function () {
            this.render();
        },
        render: function () {
            var _this = this;

            _this.$el.html(_this.template());
            feedGroupModule.onLoad("followmanager", function (fGroups) {
                fGroups.unshift({ id: -1, title: "必听组" });
                _this.$el.find("ul.grouping_list li:eq(0)").empty();
                fGroups.each(_this.doAddGroupView, _this);
                fGroups.remove(-1);
            }, _this);
            feedGroupModule.onAdd("followmanager", function (model, type) {
                if (type == "add") {
                    _this.doAddGroupView.call(_this, model);
                }
            }, _this);
        },
        doAddGroupView: function (model) {
            model.set("checked", $.inArray(model.get("id")+"", this.groups) != -1);
            this.$el.find("ul.grouping_list li:eq(0)").append(new GroupView({ model: model }).render());
        },
        show: function (options) {
            var _this = this, op = $.extend({
                id: "dialog_aftattention",
                dialogClass: "aftattention",
                header: "关注成功",
                content: _this.$el,
                onYes: function () {
                    var model;
                    var dilog_af = this.getEl();
                    var is_auto_push = false;
                    var $checked = dilog_af.find("input[type='checkbox']:checked");
                    var vals = $checked.map(function () {
                        var val = $(this).val();
                        if (!is_auto_push) {
                            is_auto_push = (val == -1);
                        }
                        return val;
                    }).get();
                    if (vals.length) {
                        model = new feedGroupModel({
                            uid: options.uid,
                            followingGroupIds: vals,
                            isAutoPush: is_auto_push
                        });
                        model.followGroups(function () {
                            _this.$(".removeBtn").click();
                            var setGroups = $(".setGroups");
                            if (setGroups.size()) {
                                var data_options = $.extend({}, $.parser.parseOptions(setGroups[0], [{
                                    uid: "number", //人id
                                    sids: "string", //组数据
                                    nickname: "string"//人名
                                }]));
                                data_options.sids = vals.join(',');
                                helper.doChangeOptions(setGroups, data_options);
                            }
                            setTimeout(function () {
                                dialog.success("分组成功", {});
                            }, 300);
                        }, function (model, data) {
                            dialog.alert(data["msg"]);
                        });
                    } else {
                        return true;
                    }

                    return false;
                }
            }, {});
            var pop = new dialog.Dialog(op);
            pop.open();
            _this.$(".grouping_title .fl span").text(options.nickname);
            if (options && options.sids) {
                _this.groups = options.sids.split(',');
            } else {
                _this.groups.length = 0;
            }
            feedGroupModule.getGroups();
            _this.undelegateEvents();
            _this.delegateEvents(_this.events);
        }
    });

    return new FollowManagerView({
        model: new Backbone.Model()
    });
});