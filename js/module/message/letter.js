/// <summary>
/// timeline模块
/// </summary>
define([
'jquery',
'underscore',
'backbone',
'module/common/iletter'],
function ($, _, Backbone, iLetter) {
    var Letter = Backbone.View.extend({
        init: function () {
            iLetter.init();
            iLetter.bind($(".msg_notice_item .detail_bottom .right a"));
            iLetter.bindDel($(".msg_notice_item .close"));
        },
        /// <summary>
        /// 释放
        /// </summary>
        release: function () {
            iLetter.release();
        }
    });

    return new Letter();
});