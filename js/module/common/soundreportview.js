define([
'jquery',
'underscore',
'backbone',
'json2',
'model/report',
'plugin/dialog',
'module/uploadimg',
'plugin/jquery.validate'],
function ($, _, Backbone, JSON, ReportModel, dialog, uploadimg) {
    var temp = [
		'<form>',
		'	<dl class="report_r1">',
		'		<dt>如果你觉得该声音内容存在问题，欢迎向管理员举报:</dt>',
        '		<dd><label><input name="reportType" type="radio" value="3">含有反动内容</label></dd>',
		'		<dd><label><input name="reportType" type="radio" value="2">版权侵权</label></dd>',
		'		<dd><label><input name="reportType" type="radio" value="1">广告欺诈</label></dd>',
		'		<dd><label><input name="reportType" type="radio" value="5">包含色情内容</label></dd>',
        '		<dd><label><input name="reportType" type="radio" value="4">其他</label></dd>',
		'	</dl>',
		'	<dl class="popup_dl">',
		'		<dt>说明</dt>',
		'		<dd><textarea class="reportText"></textarea></dd>',
		'	</dl>',
		'	<div class="report_tort hidden">',
		'		<div class="fl">',
		'			<dl>',
		'				<dt>联系人（著作本人或代理律师）</dt>',
		'				<dd><input type="text" id="username" name="username"></dd>',
		'			</dl>',
		'			<dl>',
		'				<dt>邮箱</dt>',
		'				<dd><input type="text" id="email" name="email"></dd>',
		'			</dl>',
		'			<dl>',
		'				<dt>电话</dt>',
		'				<dd><input type="text" id="phone" name="phone"></dd>',
		'			</dl>',
		'		</div>',
		'		<div class="fr" style="position:relative;">',
		'			<div class="uploadImg report_tort_pic">',
        '               <span style="z-index:1;position: absolute;top: 0px;left: 0px;padding:5px;">侵权证明材料：<br>著作权声明及版权拥有声明等(支持jpeg,jpg,bmp,png格式）</span>',
        '               <img style="width:100%;height:100%;z-index:0;" src="" alt="" />',
        '           </div>',
        '           <input type="text" style="position:absolute;top:-10000px;" id="imgPath" name="imgPath">',
        '           <a class="uploadPicBtn">上传图片</a>',
		'		</div>',
        '       ',
		'	</div>',
		'	<div class="operate"><a href="javascript:;" class="confirmBtn">确认</a></div>',
		'</form>'
    ].join('');
    var uploadUrl = config.DIRECT_DTRES_ROOT + "/cover/upload";
    var SoundReportView = Backbone.View.extend({
        template: _.template(temp),
        events: {
            "click .confirmBtn": "doReport",
            "click [name='reportType']": "doClick"
        },
        doClick: function (e) {
            var $el = $(e.currentTarget);

            if ($el.val() == "2") {
                this.$el.find(".report_tort").removeClass("hidden");
            } else {
                this.$el.find(".report_tort").addClass("hidden");
            }
            this.pop.setPosition();
        },
        initialize: function () {
            this.render();
        },
        show: function () {
            var _this = this, op = $.extend({
                id: "report_aftattention",
                dialogClass: "report",
                header: "举报",
                width: 420,
                content: _this.$el
            }, {});
            _this.render();
            _this.pop = new dialog.Dialog(op);
            _this.pop.open();
            _this.$el.find("[name='reportType']:eq(0)").attr("checked", "checked");
            new uploadimg({
                url: uploadUrl,
                $el: _this.$el.find(".uploadPicBtn"),
                maxSize: 5,
                success: function (data, file) {
                    var data1 = data.data[0];
                    _this.$el.find(" img").attr("src", config.FDFS_PATH + "//" + data1.dfsId);
                    _this.$el.find("#imgPath").val(config.FDFS_PATH + "//" + data1.dfsId);
                }
            });
            _this.$el.find("form").validate({
                rules: {
                    username: {
                        required: true
                    },
                    email: {
                        required: true,
                        email: true
                    },
                    phone: {
                        required: true
                    },
                    imgPath: {
                        required: true
                    }
                },
                messages: {
                    username: {
                        required: "联系人不能为空"
                    },
                    email: {
                        required: "邮箱不能为空",
                        email: "请填写正确的邮箱"
                    },
                    phone: {
                        required: "电话不能为空"
                    },
                    imgPath: {
                        required: "图片不能为空"
                    }
                },
                onfocusout: false,
                onkeyup: false,
                onclick: false,
                showErrors: function (map, list) {
                    var errMsg = [];

                    if (list.length) {
                        $.each(list, function (index, error) {
                            errMsg.push(error.message);
                        });
                        dialog.alert(errMsg.join('</br>'));
                    }
                },
                submitHandler: function () {
                    var report_id = _this.$el.find("[name='reportType']:checked").val();
                    var content = _this.$el.find(".reportText").val();
                    var username = _this.$el.find("#username").val();
                    var email = _this.$el.find("#email").val();
                    var phone = _this.$el.find("#phone").val();
                    var imgPath = _this.$el.find("#imgPath").val();

                    if (report_id == "2") {
                        content = {
                            "picpath": imgPath,
                            "mail": email,
                            "to_nick": username,
                            "phone": phone
                        };
                    } else {
                        content = { "content": content };
                    }
                    _this.model.set({
                        report_id: report_id,
                        content: JSON.stringify(content)
                    });

                    _this.model.doReport(function () {
                        dialog.success("举报成功!");
                        _this.pop.close();
                    }, function (model, data) {
                        dialog.alert("举报失败!");
                    });
                }
            });
        },
        doReport: function (e) {
            this.$el.find("form").submit();
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.undelegateEvents();
            this.delegateEvents(this.events);
        }
    });

    return new SoundReportView({
        model: new ReportModel()
    });
});