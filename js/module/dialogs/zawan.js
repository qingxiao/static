/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-20
 * Time: 下午5:11
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/dialog"], function ($, dialog) {
    var sync = {
        open:function (options) {

            this.createPop();
        },
        createPop:function () {
            var src = config.STATIC_ROOT+"/y/welcome.htm?file="+config.STATIC_ROOT+"/ximalaya.mp4";
            if(config.STATIC_ROOT.indexOf("test")){
                 src = "http://s1.xmcdn.com/y/welcome.htm?file=http://s1.xmcdn.com/ximalaya.mp4";
            }
            var content =
                "<iframe frameborder='0' src='"+src+"'" +
                    " marginheight='0' marginwidth='0' width='100%' scrolling='auto' style='background:#fff;border:none;'></iframe>";
            var op = {
                content:content,
                iframe:true,
                width:720,
                height:480
            };

            var pop = new dialog.Dialog(op);
            pop.open();
        }
    };
    return sync;
});
