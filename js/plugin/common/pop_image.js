/*
 * 在弹出窗中显示大图
 * 在元素上设置popsrc属性
 * popsrc 大图的地址
 */
define([ 'jquery', 'underscore', 'backbone', 'plugin/dialog' ], function($, _, Backbone, dialog) {
	$("body").on("click", "[popsrc]", function() {
		var popsrc = $(this).attr("popsrc");
		if (!popsrc) {
			return;
		}
		var pop = new dialog.Dialog({
			overlayer: {
				clickClose : true,
				opacity : 0.5
			},
			template: {
                dialog_container: '<div class="gPopup" dialog-role="container"></div>',
                dialog_body: '<div class="mask"></div><div class="con" dialog-role="body" style="border:none;background-color:#fff;"></div>',
                dialog_close: '<div class="close4Btn" dialog-role="close"></div>'
            },
			content : '<div id="imgPlaceholder" class="imgLoading" style="margin: 80px 0;"></div>',
			width : 300
		});
		pop.open();
		var image = new Image;
		image.src = popsrc;
		image.style.display = "";
		(function() {
			if (image.complete) {
				if (image.width > 640) {
					var p = 640 / image.width;
					image.height = image.height * p;
					image.width = 640;
				}
				if (image.height > 480) {
					var p = 480 / image.height;
					image.width = image.width * p;
					image.height = 480;
				}
				$("#imgPlaceholder").replaceWith($(image));
				pop.setWidth(image.width);
				pop.setPosition();
			} else {
				setTimeout(arguments.callee, 50);
			}
		})();
		return false;
	});
});