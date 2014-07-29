/*
 * 默认图片
 */
define([ 'jquery'], function($) {
	$.fn.defaultImage = function () {
        this.find("img").off("error").on("error", function(){
        	var $img = $(this),
        		$box = $img.parent();
        	$box.addClass("is-error");
        	$img.remove();
        });
        return this;
    };
});