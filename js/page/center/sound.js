/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-14
 * Time: 上午10:13
 * To change this template use File | Settings | File Templates.
 */

define(['jquery',
    "page/page_base",
    'module/player/player',
    'module/dialogs/album',
    "plugin/dialog",
    "plugin/jquery.selecter", 'module/common/sound2public'], function ($, PageBase, player, album, dialog) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            this.$el = $("#mainbox");
            player.render({$container: this.$el});
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this;
            this.$el.on("click", ".personal_addtoAlbum", function () {
                var $btn = $(this);
                var options = $.parseJSON($btn.attr('data-options') || "{}");
                options.callback = function (data) {
                    $btn.html("更改专辑");
                    dialog.success();
                };
                album.open(options);
            });
            this.$el.find('.selecter').selecter();
        },
        release: function () {
            this.callParent("release");
        }
    });
    return new Page();
});