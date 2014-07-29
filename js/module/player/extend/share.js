/*
 * 分享
 */
define([ 'jquery', 'underscore', 'backbone', 'helper', '../model', '../base' ], function($, _, Backbone, helper, Model, View) {
	var pro = View.prototype, proClone = _.clone(pro);
	_.extend(pro, {
		events : _.extend({
			"click .bdShareBtn" : "share",
			"click .player-sharebtn-pop" : "sharePop"
		}, proClone.events),
		share : function(e) {
			//console.log("share");
            var $btn = $(e.target),
                dataStr = $btn.attr("data"),
                $bds_more = $("#xima_bds_more"),
                $bdshare = $bds_more.parent();
            $bdshare.attr("data", dataStr);
            if(document.all){
                $bds_more.mouseenter();
                $bds_more.mouseleave();
            }else{
                $bds_more.mouseover();
                $bds_more.mouseout();
            }

            $bds_more.click();
            $("#bdshare_pop").attr("data", dataStr);
		},
		sharePop : function() {
			//console.log("sharePop");
		}
	});
	return View;
});