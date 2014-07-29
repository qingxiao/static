/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-12-18
 * Time: 下午6:31
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/dialog"], function($, plugin){
    plugin.applyDeal = function(){
        $.get("/passport/register_rule",function(result){
            var body_str =
                '<div class="for">' +
                    result +
                    '</div>';
            var op = {
                dialogClass:"dialog-applydeal",
                caption:"喜马拉雅网络服务使用协议",
                fixed:false,
                content:body_str,
                width:680
            };

            var pup = new plugin.Dialog(op);
            pup.open();
        });
    };
    plugin.copyright = function(){
        $.get("/passport/copyright",function(result){
            var body_str =
                '<div class="for" >' +
                    result +
                    '</div>';
            var op = {
                dialogClass:"dialog-copyright",
                caption:"版权声明",
                content:body_str,
                width:580
            };

            var pup = new plugin.Dialog(op);
            pup.open();
        });
    };
    return plugin;
});