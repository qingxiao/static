/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-26
 * Time: 下午2:22
 * To change this template use File | Settings | File Templates.
 */
define([ 'jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        /*
         * 转采
         * */

        check: function (attrs, options) {
            var attrs = this.toJSON();
            var reg = /[\u0391-\uFFE5]/g;//双字节（汉字+双字节字符）
            var temp_str = $.trim(attrs.content).replace(reg, "aa");
            var len = Math.ceil(temp_str.length / 2);
            if (len > 30) {
                return "转采不能超过30个字。";
            }
        },
        create: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;
            this.save({}, {
                url: "/handle_track/relay",
                data: {
                    no_more_alert: this.get("no_more_alert"),
                    id: this.get("trackId"),
                    content: this.get("content"),
                    sharing_to: this.get("sharing_to")
                },
                type: "post",
                success: function (model, response, options) {
                    if (response.res === false) {
                        error(model, response);
                        return;
                    }
                    success(model, response);
                },
                error: function (model, xhr, options) {
                    error(model, xhr, options);
                }
            });
        }
    });
    return Model;
});