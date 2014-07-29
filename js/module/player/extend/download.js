/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-7-25
 * Time: 上午11:27
 * 声音删除
 */
define([ 'jquery','../base','module/dialogs/download' ], function($, View, download) {
    var pro = View.prototype, proClone = _.clone(pro);
    _.extend(pro, {
        events : _.extend({
            "click .downloadToMobile " : "downloadToMobile"
        }, proClone.events),
        downloadToMobile  : function(e) {
            download.open();
        }
    });
    return View;
});