define([ 'jquery', 'underscore', './backbone' ], function($, _, Backbone) {
	Backbone.ajaxSync = Backbone.sync;
	Backbone.sync = function(method, model, options, error) {
		var data = model.toJSON(), changes = {};
		if (method == "update" || method == "create") {
			_.each(options.changes, function(value, key) {
				if (value) {
					changes[key] = data[key];
				}
			});
		}
		//backbone1.0 method=="read" 是在执行fetch时
		//将服务器端逻辑错误判断移到这里
		if (method == "read") {
			options.cache = false;
			var success = options.success;
			options.success = function(resp,a,_options){
				_options = _options || {};
				error = _options.error;
				if(!resp || resp.ret){		//如果服务器端返回空或者ret值非空或者0，那么判断为逻辑错误。
					resp = resp || {};
					removed = options.removed || $.noop;
					options.removed(model, resp, _options);
					return;
				}
				success(resp, a, _options);
			};
		}
		//自定义请求参数
		options.data = _.extend({}, changes, options.data);
		return Backbone.ajaxSync.apply(this, [ method, model, options, error ]);
	};
	return Backbone;
});