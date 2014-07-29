/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-7
 * Time: 下午4:37
 * To change this template use File | Settings | File Templates.
 */
/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-29
 * Time: 上午10:37
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'page/page_base', 'module/player/player','module/comment_box', 'module/dialogs/share2friend', 'module/common/ireport','helper'],
    function ($, PageBase, player, CommentBoxModel, share2friend, ireport, helper) {

        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.$el = $(".mainbox_wrapper");
                this.initPlayer();
                this.bindEvents();

                ireport.init();
                if(helper.isLogin()){
                    this.initAjaxContent();
                }
            },
            initPlayer:function(){
                var _this = this;
                 player.render({
                     $container:_this.$el.find(".personal_container")
                 });
            },
            initAjaxContent:function(){
                //右侧
                var right = "/album/"+this.getAlbumId()+"/show_right",
                    $right = this.$el.find(".mainbox_right"),
                    _this = this;
                $right.addClass("loadingMore").load(right, function(){
                    $right.removeClass("loadingMore");
                    _this.afterRender();
                });
            },
            getAlbumId:function(){
                var url = window.location.href,
                    id = url.replace(/.*album\//i,"").replace(/\?.*/, "");
                id = id.replace(/\D+/, "");
                return id;
            },
            bindEvents:function(){

                var _this = this,
                    $el = this.$el;
                //专辑声音列表展开更多
                $el.on("click", ".album_soundlist .more", function(){
                    $el.find(".album_soundlist").addClass("is-more");
                });
                //简介展开收起
                var $mid_intro = $el.find(".mid_intro"),
                    $rich_intro = $el.find(".rich_intro");
                $el.on("click", ".mid_intro .arrow", function(){
                    $mid_intro.stop().slideUp();
                    $rich_intro.stop().slideDown();
                });
                $el.on("click", ".rich_intro .arrow", function(){
                    $mid_intro.stop().slideDown();
                    $rich_intro.stop().slideUp();
                });
                //富文本 A标签跳转
                $el.on("click", ".rich_intro a", function(){
                    var host = this.host,
                        href = this.href;
                    if(host){
                        var win_host = window.location.host;
                        if(host == win_host){
                            window.location.href = href;
                        }else{
                            window.open(href);
                        }
                    }
                    return false;
                });
                //
                $el.find(".detail_soundBox").on("onSoundPlay", function(e, sound){
                    var sound_id = sound.id,
                        $album_list = $el.find(".album_soundlist"),
                        $curLi = $album_list.find("[sound_id="+sound_id+"]");
                    if($curLi.index()>=10){
                        $album_list.addClass("is-more");
                    }
                    $album_list.find(".focus").removeClass("focus");
                    $curLi.addClass("focus");
                });

                $el.on("click", ".album_soundlist .shareBtn", function(){
                    var $btn = $(this),
                        id = $btn.attr("track_id"),
                        uid = $btn.attr("track_uid");
                    share2friend.open(id, uid);

                });

            },
            unbindEvents: function () {
                this.$el.off();
                ireport.release();
            }
        });
        return new Page();
    });