define([
'jquery',
'underscore',
'backbone',
'model/report',
'plugin/dialog'],
function ($, _, Backbone, ReportModel, dialog) {
    var temp = [
		'<dl class="report_r1">',
		'	<dt>如果你觉得该声音内容存在问题，欢迎向管理员举报:</dt>',
		'	<dd><label><input name="reportType" type="radio" value="6">垃圾广告</label></dd>',
		'	<dd><label><input name="reportType" type="radio" value="10">人身攻击我</label></dd>',
		'	<dd><label><input name="reportType" type="radio" value="7">虚假中奖</label></dd>',
		'	<dd><label><input name="reportType" type="radio" value="11">骚扰我</label></dd>',
		'	<dd><label><input name="reportType" type="radio" value="8">含有色情内容</label></dd>',
        '	<dd><label><input name="reportType" type="radio" value="12">冒充我</label></dd>',
        '	<dd><label><input name="reportType" type="radio" value="9">含有反动内容</label></dd>',
        '	<dd><label><input name="reportType" type="radio" value="13">泄露我隐私</label></dd>',
        '	<dd><label><input name="reportType" type="radio" value="14">其他</label></dd>',
		'</dl>',
		'<dl class="popup_dl">',
		'	<dt>说明</dt>',
		'	<dd><input type="text" class="reportText" /></dd>',
		'</dl>',
		'<div class="operate"><a class="confirmBtn">确认</a></div>'
    ].join('');
    var CommentReportView = Backbone.View.extend({
        template: _.template(temp),
        events: {
            "click .confirmBtn": "doReport"
        },
        initialize: function () {
            this.render();
        },
        show: function () {
            var _this = this, op = $.extend({
                id: "report_aftattention",
                dialogClass: "report",
                header: "举报",
                content: _this.$el
            }, {});
            _this.render();
            _this.pop = new dialog.Dialog(op);
            _this.pop.open();
            _this.$el.find("[name='reportType']:eq(0)").attr("checked", "checked");
            _this.undelegateEvents();
            _this.delegateEvents(_this.events);
        },
        doReport: function (e) {
            var _this = this;
            var report_id = _this.$el.find("[name='reportType']:checked").val();
            var content = _this.$el.find(".reportText").val();

            _this.model.set({
                report_id: report_id,
                content: JSON.stringify({ content: content })
            });

            _this.model.doReport(function () {
                dialog.success("举报成功!");
                _this.pop.close();
            }, function (model, data) {
                dialog.alert("举报失败!");
            });
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
        }
    });

    return new CommentReportView({
        model: new ReportModel()
    });
});