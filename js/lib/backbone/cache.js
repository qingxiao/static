define([ 'jquery', 'underscore', './backbone' ], function($, _, Backbone) {
	var pro = Backbone.Model.prototype, proClone = _.clone(pro);
	_.extend(Backbone.Model, {
		cache : null
	});
	_.extend(pro, {
		/*
		 * overwrite 从服务器端拿数据,得到新数据后更新缓存
		 */
		fetch : function(options) {
			options = options || {};
			var success = options.success || $.noop, removed = options.removed || $.noop, error = options.error || $.noop, Model = this.constructor, cache = Model.cache;
			if (cache) {
				_.extend(options, {
					success : function(model, resp, options) {
						cache.cache(model);
						success(model, resp, options);
					},
					removed : function(model, resp, options) {
						cache.markRemoved(model);// id添加到已删除列表
						removed(model, resp, options);
					},
					error : function(model, xhr, options) {
						error(model, xhr, options);
					}
				});
			}
			proClone.fetch.call(this, options);
		},
		/*
		 * 从缓存拿数据
		 */
		query : function(options) {
			var success = options.success || $.noop, removed = options.removed || $.noop, Model = this.constructor, cache = Model.cache, model = null;
			if (!cache) {
				this.fetch(options);
				return;
			}
			if (cache.isRemoved(this)) {
				removed(this);
				return;
			}
			model = cache.get(this);
			if (model) {
				success(model);
			} else {
				this.fetch(options);
			}
		}
	});
	var cPro = Backbone.Collection.prototype, cProClone = _.clone(cPro);
	_.extend(cPro, {
		/*
		 * overwrite 从服务器端拿数据,得到新数据后更新缓存
		 */
		fetch : function(options) {
			options = options || {};
			var success = options.success || $.noop, Model = this.model, cache = Model.cache;
			if (cache) {
				_.extend(options, {
					success : function(collection, response, options) {
						cache.cache(collection.models);
						success(collection, response, options);
					}
				});
			}
			cProClone.fetch.call(this, options);
		},
		/*
		 * 从缓存拿数据
		 * @param options.ids {Array} 集合中Model的id数字,会过滤掉已经在缓存中的id,原始的ids可以通过options.preIds获取
		 */
		query : function(options) {
			var success = options.success || $.noop, Model = this.model, cache = Model.cache, cached = [], ids = options.ids;
			if (!cache) {
				this.fetch(options);
				return;
			}
			if (ids) {
				var idsNeedToQuery = [];
				ids = _.isArray(ids) ? ids : [ ids ];
				// 由于查询比较消耗服务器资源，因此已经请求过的不再请求
				for ( var i = 0, len = ids.length; i < len; i++) {
					var id = ids[i], model = Model.cache.getCachedById(id);
					if (!model) {
						idsNeedToQuery.push(id);
					} else {
						cached.push(model);
					}
				}
				if (!idsNeedToQuery.length) {
					success(Model.cache.getCachedByIds(ids));
					return;
				}
				options.preIds = options.ids;
				options.ids = idsNeedToQuery;
			}
			options.success = function(collection, response, options) {
				collection.add(cached);
				success(collection, response, options);
			};
			this.fetch(options);
		}
	});
	return Backbone;
});