/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-9
 * Time: 下午3:02
 * To change this template use File | Settings | File Templates.
 */

define(["jquery", "plugin/dialog", "module/comment_box"], function ($, dialog, CommentBoxModel) {
    var sync = {
        open: function (track_id,isComment, callback) {
            this.callback = callback || $.noop;
            this.track_id = track_id;
            this.isComment = isComment;
            this.createPop();
        },
        createPop: function () {
            var _this = this,
                obj = {
                    text:"转采",
                    count:30,
                    type:"relay"
                };
            if(this.isComment){
                obj = {
                    text:"评论",
                    count:140,
                    type:"comment"
                };
            }
            var html =
                '<textarea placeholder="写点'+obj.text+'理由吧"></textarea>' +
                    '<div class="popup_btm">' +
                    '<div class="fl">' +
                    '<span>分享到</span>' +
                    '<a href="javascript:;" class="qqWeiboBtn" data-name="tQQ" data-type="'+obj.type+'" title="腾讯微博"></a>' +
                    '<a href="javascript:;" class="qZoneBtn" data-name="qzone" data-type="'+obj.type+'" title="qq空间"></a>' +
                    '<a href="javascript:;" class="sinaWeiboBtn" data-name="tSina" data-type="'+obj.type+'" title="新浪微博"></a>' +
                    '<a href="/passport/profile"  target="_blank">配置</a></div>' +
                    '<div class="fr"><span class="charCount">还剩<em>'+obj.count+'</em>字</span>' +
                    '<a href="javascript:;" class="faceBtn"></a>' +
                    '<a href="javascript:;" class="submitBtn"><span>'+obj.text+'</span></a>' +
                    '</div></div>';
            var op = {
                dialogClass: "forward",
                header: obj.text,
                content: html
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            var $textarea = this.$el.find("textarea");
            new CommentBoxModel({
                $el: this.$el,
                trackId: _this.track_id,
                $input:$textarea,
                isForward:!_this.isComment,
                success: function (response) {
                   _this.pop.close();
                    _this.callback(response);
                },
                error:function(){
                    _this.pop.close();
                }
            });
        }
    };
    return sync;
});
