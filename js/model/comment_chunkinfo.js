/*
 * 声音的分段信息
 */
define([ 'jquery', 'underscore', 'backbone', './cache' ], function($, _, Backbone, Cache) {
	var Model = null;
	Model = Backbone.Model.extend({
		defaults : {
			id : "",
			chunks : [],
			duration : 0
		},
		fetch : function(options) {
			options = options || {};
			_.extend(options, {
				url : '/track_blocks/avatars',
				type : "get"
			});
			options.data = {
				track_ids : this.id
			};
			Backbone.Model.prototype.fetch.call(this, options);
		},
		parse : function(response, options) {
			for (id in response) {
				var info = response[id];
				return {
					id : id,
					chunks : info[0],
					duration : info[1]
				};
			}
		}
	}, {
		cache : new Cache()
	});
	window.t = Model;
	return Model;
});