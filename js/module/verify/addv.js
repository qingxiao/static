/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'model/verify',
'plugin/dialog',
'module/uploadimg',
'module/verify/soundselect',
'plugin/jquery.validate'],
function ($, _, Backbone, VerifyModel, dialog, uploadimg, soundselect) {
    var uploadUrl = config.DIRECT_DTRES_ROOT + "/cover/upload";
    var Addv = Backbone.View.extend({
        /// <summary>
        /// 时间轴初始化
        /// </summary>
        init: function () {
            var _this = this;
            var validator = $("form").validate({
                //highlight: false,
                errorClass: "is-error",
                rules: {
                    real_name: {//用户名
                        required: true
                    },
                    identity_card: {//身份证
                        required: true
                    },
                    phone: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    track_id: {
                        required: true
                    }
                },
                messages: {
                    real_name: {//用户名
                        required: "姓名不能为空"
                    },
                    identity_card: {//身份证
                        required: "身份证号码不能为空"
                    },
                    phone: {
                        required: "联系电话不能为空"
                    },
                    email: {
                        required: "Email不能为空",
                        email: "Email格式不正确"
                    },
                    track_id: {
                        required: "请选择一首原创声音"
                    }
                },
                errorPlacement: function (error, element) {
                    error.addClass("error1");
                    error.appendTo(element.parent());
                    //element.addClass("is-error");
                },
                showLabel: function () {
                    alert(1);
                },
                success: function (label, element) {
                    label.addClass("valid");
                    //$(element).removeClass("is-error");
                }
            });
            //选取声音
            $(".soundBtn").on("click", function () {
                _this.model.getTrackList(function (model, data) {
                    soundselect.model.set("track_id", $("#track_id").val());
                    soundselect.show({}, data);
                }, function () { });
            });
            $(".selecter.selecter-s5").selecter().on("change", function () {
                var $this = $(this);
                $("#human_category_id").val($this.selecter("val"));
            });
            //提交
            $("a.confirmBtn").on("click", function () {
                $("form").submit();
            });
            $("a.cancelBtn").on("click", function () {
                dialog.confirm("是否要取消加V操作？", function () {
                    location.href = "/";
                });
            });
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {

        }
    });

    return new Addv({
        model: new VerifyModel()
    });
});