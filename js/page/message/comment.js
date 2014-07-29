/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-21
 * Time: 上午11:19
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', "page/page_base",'page/message/referme','plugin/dialog','model/comment'], function ($, PageBase, referme, dialog, CommentModel) {
    var Page = PageBase.extend({
        model:new CommentModel(),
        init: function () {
            this.callParent("init");
            referme.init();
            this.$el = $("#mainbox");
            this.bindEvents();
        },
        bindEvents:function(){
            var _this = this;
            this.$el.on("click",".destroyBtn", function(){
                _this.destroyComment($(this));
            });
        },
        destroyComment:function($btn){
            var data = $.parseJSON($btn.attr("data-options")),
                $item = $btn.closest(".msg_notice_item"),
                _this = this;
            dialog.confirm("确定删除？", function(){
                _this.model.set({
                    track_id:data.t_id,
                    comment_id:data.c_id
                });
                _this.model.delMycenter(function(){
                    $item.slideUp();
                    dialog.success("删除成功");
                },function(model, res){
                    dialog.alert(res.msg||"服务器繁忙,请稍后再试!");
                });
            });
        },
        release: function () {
            this.callParent("release");
            referme.release();
        }
    });
    return new Page();
});