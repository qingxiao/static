define([ 'jquery', 'underscore', './backbone/backbone', './backbone/cache', './backbone/sync' ], function($, _, Backbone) {
	Backbone.emulateHTTP = false; //关闭restful请求形式
	Backbone.emulateJSON = true;
	return Backbone;
});