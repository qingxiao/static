/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午5:14
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'page/page_base',
    'model/setting',
    'plugin/dialog'],
    function ($, PageBase, SettingModel, dialog) {
        var Page = PageBase.extend({
            model: new SettingModel(),
            init: function () {
                this.callParent("init");
                this.bindEvents();
            },
            bindEvents: function () {
                var _this = this;
                $(".confirmBtn").on("click", function () {
                    _this.submit();
                });
            },
            submit: function () {
                this.model.set("postData", $("form").serialize());
                this.model.privacy(function (data) {
                    dialog.success("保存成功");
                }, function (data) {
                    dialog.alert("保存失败");
                });
            },
            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });