/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-7
 * Time: 下午2:43
 * To change this template use File | Settings | File Templates.
 */

define(["jquery", "plugin/dialog"], function ($, dialog) {
    var sync = {
        open:function (options) {
            this.options = $.extend({
                noCheckBox:false,
                syncFn: $.noop,
                unSyncFn: $.noop,
                text:"温馨提示：您的评论将会被自动同步到微博、腾讯?"
            }, options);

            this.createPop();
        },
        createPop:function () {
            var ops = this.options,
                checked = false;
            var html =
                '<div class="msg_title">'+ops.text+'</div>' +
                '<div class="operate"><a href="javascript:;" class="confirmBtn" dialog-role="yes">同步</a>' +
                '<a href="javascript:;" class="cancelBtn" dialog-role="cancel">不同步</a></div>' +
                '<div class="msg_noprompt"><input type="checkbox"><label>下次不再提示</label></div>';
            var op = {
                dialogClass:"msg msg_sync",
                close:false,
                content:html,
                onYes:function(){
                    ops.syncFn(checked);
                },
                onCancel:function(){
                    ops.unSyncFn(checked);
                }
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            var $el = pop.getEl();
            $el.find("input[type=checkbox]").on("click",function(){
                checked = !!this.checked;
            });
            if(ops.noCheckBox){
                $el.find(".msg_noprompt").hide();
            }
        }
    };
    return sync;
});
