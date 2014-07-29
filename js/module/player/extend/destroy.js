/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-14
 * Time: 上午11:27
 * 声音删除
 */
define([ 'jquery', 'underscore', 'backbone', 'helper', '../model', '../base','plugin/dialog','model/sound' ], function($, _, Backbone, helper, Model, View, dialog, SoundModel) {
    var pro = View.prototype, proClone = _.clone(pro);
    _.extend(pro, {
        events : _.extend({
            "click .destroyBtn" : "destroy"
        }, proClone.events),
        destroy : function(e) {
            var _this = this,
                $btn = $(e.target),
                destroyId = $btn.attr("destroy_id");

            dialog.confirm("你确定要删除该声音吗?", function(){
                var model = new SoundModel({
                    id:destroyId
                });
                model.destroy(function(res){
                    _this.$el.slideUp(function(){
                        _this.$el.remove();
                    });
                },function(res){
                    dialog.alert(res.msg);
                });
            });

        }
    });
    return View;
});