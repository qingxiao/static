/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-14
 * Time: 上午9:58
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', "page/page_base", 'module/player/player', 'plugin/dialog'], function ($, PageBase, player, dialog) {
    var Page = PageBase.extend({
        init: function () {
            this.callParent("init");
            this.$el = $("#mainbox");
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this;
            this.$el.on("click", ".miniPlayer3 .playBtn", function () {
                var $btn = $(this),
                    $player = $btn.closest(".miniPlayer3");
                if ($player.attr("sound_id")) {
                    return;
                }
                var $item = $btn.closest("[album_id]"),
                    album_id = $item.attr("album_id");
                _this.initSoundId($player, $btn, album_id);
            });
            //删除专辑
            this.$el.on("click", ".destroyBtn", function(){
                var $btn = $(this),
                    $item = $btn.closest("li[album_id]"),
                    album_id = $item.attr("album_id");
                dialog.confirm("确定要删除专辑吗？", function(checked){
                    _this.destroyAlbum(album_id, checked, function(){
                        $item.fadeOut();
                    });
                }, {checkbox:"同时删除专辑下的声音"});
            });
        },
        destroyAlbum:function(album_id, removeSound, callback){
            $.post("/my_albums/"+album_id+"/destroy", {removeSound:removeSound},function(){
                  dialog.success("删除成功");
                callback();
            });
        },
        initSoundId: function ($player, $btn, album_id) {
            $.get("/album/" + album_id + "/sound_ids", function (ids) {
                var first = ids[0];
                $player.attr("sound_id", first);
                player.render({$container: $player});
                $btn.trigger("click");
            });
        },
        release: function () {
            this.callParent("release");
        }
    });
    return new Page();
});
