define([ 'jquery', 'underscore', 'backbone', 'model/comment' ], function($, _, Backbone, Model) {
	var Collection = Backbone.Collection.extend({
		model : Model,
		fetch : function(options) {
			options = options || {};
			var data = options.data || {};
			if (data.soundId === undefined || data.chunkIndex === undefined) {
				return;
			}
			_.extend(options, {
				url : '/tracks/' + data.soundId + '/' + data.chunkIndex
			});
			data.soundId = undefined;
			data.chunkIndex = undefined;
			Backbone.Collection.prototype.fetch.call(this, options);
		},
		parse : function(response) {
			return response.comments;
		}
	});
	return Collection;
});