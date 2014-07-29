/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-17
 * Time: 上午11:06
 * To change this template use File | Settings | File Templates.
 */
define(['jquery',"page/page_base", 'module/common/ireport',"module/common/iletter", "module/common/ifollow"],
    function($, PageBase,  ireport, iletter, ifollow) {
    var Page = PageBase.extend({
        init:function(){
            this.callParent("init");
            this.$el = $("#mainbox");
            ireport.init();
            ifollow.init();
            iletter.bind($(".sendLetterBtn"));
        },
        release:function(){
            this.callParent("release");
        }
    });
    return new Page();
});