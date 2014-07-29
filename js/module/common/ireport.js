define([
'jquery',
'underscore',
'backbone',
'model/report',
'module/common/soundreportview',
'module/common/commentreportview'],
function ($, _, Backbone, ReportModel, soundReportView, commentReportView) {
    var iReportView = Backbone.View.extend({
        init: function () {
            this.release();
            $(".reportBtn").on("click", [this], this.doReport);
            $(".reportBtn2").on("click", [this], this.doReport);
        },
        doBindOne: function ($el) {
            $el.on("click", [this], this.doReport);
        },
        doReport: function (e) {
            var view = e.data[0];

            view.doReport1(this, view);
        },
        doReport1: function (e, view) {
            //var $el = $(e);
            var data_options = $.extend({}, $.parser.parseOptions(e, [
            {
                track_id: "number",
                content_title: "string",
                content_type: "number"
            }]));
            if (data_options.content_type == 2) {//举报评论
                commentReportView.model = new ReportModel(data_options);
                commentReportView.show();
            } else if (data_options.content_type == 1) {//举报声音
                soundReportView.model = new ReportModel(data_options);
                soundReportView.show();
            }

        },
        release: function () {
            $(".reportBtn").off("click");
            $(".reportBtn2").off("click");
        }
    });

    return new iReportView({
        model: new ReportModel()
    });
});