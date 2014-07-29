define([ 'jquery', 'underscore', 'backbone', 'collection/comment_chunkinfo' ], function($, _, Backbone, ChunkInfoSet) {
	var comment2d = {
		render : function(views) {
			var soundIds = [], view;
			for ( var i = 0, len = views.length; i < len; i++) {
				view = views[i];
				var soundId = view.getSoundId();
				if(_.indexOf(soundIds, soundId) == -1)soundIds.push(soundId);
			}
			var set = new ChunkInfoSet();
			set.query({
				ids : soundIds,
				success : function(collection) {
					for ( var i = 0, len = views.length; i < len; i++) {
						var view = views[i], soundId = view.getSoundId();
						view.setChunkInfoModel(collection.get(soundId));
						view.render();
					}
				}
			});
		}
	};
	return comment2d;
});