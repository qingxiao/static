/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/discovery/album_sound', "underscore","module/player/player"],
    function ($, PageAlbumSound, _, player) {

        var Page = PageAlbumSound.extend({
            container: "#discoverAlbum",
            url_album: "/explore/album_detail",
            data: {
                category: 0,
                type: "album",
                condition: "",
                tag:""
            },
            init: function () {
                this.initCommon();
                this.$container = $("#discoverAlbum");
                this.$layoutRight = this.$container.find(".layout_right");
                player.render({$container: this.$layoutRight});
            },
            initData: function () {
                var $container = this.$container,
                    $curSort = $container.find(".sort_list li.on"),
                    $curNav = $container.find(".nav_list li.on");
                this.data.category = $curSort.attr("cid");
                this.data.condition = $curNav.attr("condition");
            },
            onTagSelect: function () {
            	//this.data.category = category;//pang
                if(window.console) console.log(this.data);
                this.data_tag = this.data.tag;
                this.getAlbumList(1);
            },
            getAlbumList: function (page) {
                var _this = this;
                var data = $.extend({}, this.data, {
                    page:page,
                    tag:_this.data_tag
                });
                $.get(this.url_album, data, function (html) {
                    $(".layout_right").html(html);
                    player.render({$container: this.$layoutRight});
                });
            },
            release: function () {
                this.callParent("release");
                this.unbindEvents();
            },
            bindEvents: function () {
                this.callParent("bindEvents");
                var $container = this.$container,
                    _this = this;
                $container.on("click", ".pagingBar [data-page]", function () {
                    _this.getAlbumList($(this).attr("data-page"));
                });
                //播放按钮
                $container.on("click", ".discoverAlbum_wrapper .playBtn", function(){
                    var $btn = $(this),
                        $player = $btn.closest(".miniPlayer3");
                    if($player.attr("sound_id")){
                        return;
                    }
                    var $item = $btn.closest(".discoverAlbum_item"),
                        album_id = $item.attr("album_id");
                    _this.initSoundId($player, $btn, album_id);
                });
            },
            initSoundId:function($player, $btn, album_id){
                $.get("/album/"+album_id+"/sound_ids", function(ids){
                    var first = ids[0];
                    $player.attr("sound_id", first);
                    player.render({$container: $player});
                    $btn.trigger("click");
                });
            },
            unbindEvents: function () {
                this.callParent("unbindEvents");
            }
        });
        return new Page();
    });