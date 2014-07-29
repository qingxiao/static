/// <summary>
/// timelineģ��
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/notice',
'plugin/jquery.parser'],
function ($, _, Backbone, NoticeModel) {
    var Notice = Backbone.View.extend({
        init: function () {
            var _this = this;

            $(".close").on("click",function () {
                var that = this;
                var data_options = $.extend({}, $.parser.parseOptions(that, [{ id: "number"}]));
                if (data_options.id) {
                    _this.model.set("id", data_options.id);
                    _this.model.deleteNotice(function () {
                        $(that).closest(".msg_notice_item").slideUp();
                    }, function (model, data) {
                        alert(data.msg);
                    });
                }
            });
        },
        /// <summary>
        /// �ͷ�
        /// </summary>
        release: function () {

        }
    });

    return new Notice({
        model: new NoticeModel()
    });
});