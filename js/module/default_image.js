/*
 * 默认图片
 * 用来处理声音，用户，专辑的默认图片
 */
define([ 'jquery', 'underscore', 'backbone', 'plugin/jquery.default_image' ], function($, _, Backbone) {
	var defaultImage = {
		init : function() {
			this.render();
		},
		/*
		 * 渲染
		 * @param options {Object}
		 * options.$container {Jquery} 渲染范围，尽量提供，可提高性能
		 */
		render : function(options) {
			var op = options || {}, $container = op.$container, $els;
			if($container){
				$els = $container.find(".userface,.albumface,.soundface");
			}else{
				$els = $(".userface,.albumface,.soundface");
			}
			$els.defaultImage();
		},
		/*
		 * 释放
		 */
		release : function() {
		}
	};
	return defaultImage;
});