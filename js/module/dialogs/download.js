/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午3:02
 * To change this template use File | Settings | File Templates.
 */

define(["jquery", "plugin/dialog"], function ($, dialog) {
    var download = {
        open: function (options) {
            this.options = options;
            this.createPop();
        },

        createPop: function (data) {
            var html =
                '<div class="code">' +
                    '<a target="_blank" href="/download">' +
                    '<img src="'+config.STATIC_ROOT+'/css/img/code.png"/>下载手机版' +
                    '</a>' +
                    '<div class="logo"></div>' +
                    '</div><div class="info"></div>';
            var op = {
                dialogClass: "download",
                header: "下载",
                content: html
            };

            var pop = new dialog.Dialog(op);
            pop.open();
        }
    };

    return download;
});
