define([ 'jquery', 'underscore', 'backbone', 'model/comment_chunkinfo' ], function($, _, Backbone, Model) {
	var Collection = Backbone.Collection.extend({
		model : Model,
		fetch : function(options) {
			options = options || {};
			options.data = options.data || {};
			options.data.track_ids = options.ids.join(",");
			_.extend(options, {
				url : '/track_blocks/avatars',
				type : "get"
			});
			Backbone.Collection.prototype.fetch.call(this, options);
		},
		parse : function(response, options) {
			// response = {
			// "80082" : [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "259.19" ],
			// "80084" : [ [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "266.66" ],
			// "79221" : [ [ 0, 0, 0, 1, 0, 0, 0 ], "13.68" ],
			// "73879" : [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "257.77" ]
			// };
			return _.map(response, function(data, id) {
				var res = {};
				var chunkNum = data[0];
				var chunkData = data[1];
				var duration = data[2];
				var chunks = [];
				for(var i=0;i<chunkNum;i++){
					chunks.push(chunkData[i]||[]);
				}
				var info = [chunks,duration];
				res[id] = info;
				return res;
			});

			// return [ {
			// "80082" : [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "259.19" ]
			// }, {
			// "80084" : [ [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 400, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "266.66" ]
			// }, {
			// "79221" : [ [ 0, 0, 0, 1, 0, 0, 0 ], "13.68" ]
			// }, {
			// "73879" : [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "257.77" ]
			// } ];
		}
	});
	return Collection;
});