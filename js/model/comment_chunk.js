/*
 * 声音分段详情
 */
define([ 'jquery', 'underscore', 'backbone', './cache', 'collection/comment', 'model/comment' ], function($, _, Backbone, Cache, CommentSet, CommentModel) {
	var lastQueryId  = "";
	var Model = Backbone.Model.extend({
		defaults : {
			id : "",
			comments : new CommentSet(),
			count:0,
			soundId : "",
			index : 0
		},
		fetch : function(options) {
			if(lastQueryId == this.id) return;
			lastQueryId = this.id;
			_.extend(options, {
				url : '/tracks/' + this.get("soundId") + '/' + this.get("index")
			});
			Backbone.Model.prototype.fetch.call(this, options);
		},
		parse : function(response, options) {
			var commentSet = new CommentSet();
			_.each(response.comments, function(comment, index){
				var model = new CommentModel(comment, {parse: true});
				commentSet.add(model);
			});
			return {
				comments : commentSet
			};
		}
	}, {
		cache : new Cache()
	});
	return Model;
});