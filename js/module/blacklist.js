/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-15
 * Time: 下午3:10
 * To change this template use File | Settings | File Templates.
 */
define(['jquery','plugin/dialog', 'model/setting'], function($, dialog, SettingModel){
    var setting = new SettingModel();
    var blacklist = {
       add:function(nickname, uid, callback){
           callback = callback || $.noop;
           var text = "确认将"+nickname+"加入到我的黑名单中么？<br/>(你和他将自动解除关注关系，并且他不能再关注你，他不能再给你发评论、私信、@通知。)";
           dialog.confirm(text, function(){
               setting.addBackList(uid, function(response){
                   dialog.success("拉黑成功");
                   callback(response);
               }, function(response){
                   dialog.alert(response.message || "添加失败");
               });
           });

       },
        remove:function(nickname, uid, callback){
            callback = callback || $.noop;
            dialog.confirm("你确定要将"+nickname+"从你的黑名单中解除么？", function(){
                setting.removeBackList(uid, function (response) {
                    dialog.success("移除成功");
                    callback(response);
                }, function (response) {
                    dialog.alert(response.message || "移除黑名单失败");
                });
            });
        }
    };
    return blacklist;
});