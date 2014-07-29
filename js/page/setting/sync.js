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
    'model/thirdpart',
    'plugin/dialog'],
    function ($, PageBase, PassportModel, dialog) {
        var passportModel = new PassportModel();

        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.$el = $(".set_container");
                this.bindEvents();
                this.$el.find("form").attr("autocomplete", "off");
            },
            bindEvents: function () {
                var $setSync = this.$el,
                    _this = this;
                $setSync.on("click", ".set_syncInner [data-bind]", function () {
                    var name = $(this).attr("data-bind");
                    _this.addBind(name);
                });
                $setSync.on("click", ".set_syncInner [data-unbind]", function () {
                    var name = $(this).attr("data-unbind");
                    _this.unBind(name);
                });
                $setSync.on("click", ".confirmBtn", function () {
                    _this.submit();
                    return false;
                });
            },
            submit: function () {
                var data = this.$el.find("form").serialize(),
                    _this = this;
                $.post("/passport/sync_set_save", data, function () {
                    dialog.success("保存成功");
                    _this.success();
                });
            },
            success: function () {
                $.get("/passport/sync_set_part", function (html) {
                    $(".set_container .set_right").html(html);
                });
            },
            addBind: function (name) {
                var _this = this;
                passportModel.addBind(name, function () {
                    _this.success();
                });
            },
            unBind: function (name) {
                var obj = {
                    tSina: "新浪微博",
                    qzone: "QQ"
                };
                var _this = this;
                dialog.confirm("是否要解除绑定,解绑后不能再用该" + obj[name] + "帐号登录？", function () {
                    passportModel.unBind(name, function (data) {
                        _this.success();
                    }, function (data) {
                        dialog.alert(data.msg);
                    });

                });
            },

            release: function () {
                this.callParent("release");
            }
        });
        return new Page();
    });