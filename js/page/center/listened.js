/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-14
 * Time: 上午10:14
 * To change this template use File | Settings | File Templates.
 */
define(['jquery',"page/page_base", 'module/player/player'],function($, PageBase, player) {
    var Page = PageBase.extend({
        init:function(){
            this.callParent("init");
            this.$el = $("#mainbox");
            player.render({$container:this.$el});
        },
        release:function(){
            this.callParent("release");
        }
    });
    return new Page();
});